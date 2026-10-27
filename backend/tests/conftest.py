import os
import shutil
import tempfile

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

# uploads made by the tests go to a temporary folder, never the real backend/media.
# This has to happen before the app is imported, because the app reads MEDIA_DIR when it starts
TEST_MEDIA_DIR = tempfile.mkdtemp(prefix="chapel-test-media-")
os.environ["MEDIA_DIR"] = TEST_MEDIA_DIR

from app.config import settings
from app.database import Base, get_db
from app.main import app
from app.models import Admin
from app import rate_limit
from app.security import create_access_token, hash_password

TEST_PASSWORD = "test-password-123"


@pytest.fixture(scope="session")
def engine():
    test_url = settings.test_database_url
    if not test_url:
        pytest.exit(
            "TEST_DATABASE_URL is not set.\n"
            "Create an empty database (e.g. chapel_test) and add a line like this to backend/.env:\n"
            "TEST_DATABASE_URL=postgresql+psycopg://YOUR_USER:YOUR_PASSWORD@localhost:5432/chapel_test",
            returncode=1,
        )

    # safety check: the tests delete everything, so never point them at the real database
    real = make_url(settings.database_url)
    test = make_url(test_url)
    if (test.host, test.port, test.database) == (real.host, real.port, real.database):
        pytest.exit("TEST_DATABASE_URL points at your real database. Use a separate one (e.g. chapel_test).", returncode=1)

    engine = create_engine(test_url)
    # fresh tables for this test run (the tests don't need alembic)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture(scope="session")
def session_factory(engine):
    return sessionmaker(bind=engine, autoflush=False)


@pytest.fixture(autouse=True)
def clean_tables(engine):
    # empty every table before each test, so tests never affect each other
    table_names = ", ".join(table.name for table in Base.metadata.sorted_tables)
    with engine.begin() as connection:
        connection.execute(text(f"TRUNCATE {table_names} RESTART IDENTITY CASCADE"))


@pytest.fixture
def db_session(session_factory):
    # a session the tests can use to add or check rows directly
    session = session_factory()
    yield session
    session.close()


@pytest.fixture
def client(session_factory):
    # make the app use the test database instead of the real one
    def override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="session")
def test_password_hash():
    # hashing a password is slow on purpose, so we do it once and reuse it
    return hash_password(TEST_PASSWORD)


def create_admin(db_session, email, role, password_hash):
    admin = Admin(full_name=f"Test {role}", email=email, password_hash=password_hash, role=role)
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


def make_auth_headers(admin):
    token = create_access_token(admin.id, admin.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def super_admin(db_session, test_password_hash):
    return create_admin(db_session, "super@test.com", "super_admin", test_password_hash)


@pytest.fixture
def editor(db_session, test_password_hash):
    return create_admin(db_session, "editor@test.com", "editor", test_password_hash)


@pytest.fixture
def viewer(db_session, test_password_hash):
    return create_admin(db_session, "viewer@test.com", "viewer", test_password_hash)


@pytest.fixture
def super_admin_headers(super_admin):
    return make_auth_headers(super_admin)


@pytest.fixture
def editor_headers(editor):
    return make_auth_headers(editor)


@pytest.fixture
def viewer_headers(viewer):
    return make_auth_headers(viewer)


@pytest.fixture
def media_dir():
    # the temporary media folder from the top of this file, emptied before each test
    folder = settings.media_dir
    for path in folder.iterdir():
        path.unlink()
    return folder


@pytest.fixture(scope="session", autouse=True)
def remove_test_media_dir():
    yield
    shutil.rmtree(TEST_MEDIA_DIR, ignore_errors=True)


@pytest.fixture(autouse=True)
def reset_rate_limits():
    # the "too many tries" counters live in memory, so each test starts with clean counts
    rate_limit.login_failures_per_email.clear()
    rate_limit.login_failures_per_ip.clear()
    rate_limit.member_signups_per_ip.clear()
    yield
