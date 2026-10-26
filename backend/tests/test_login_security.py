from datetime import datetime, timedelta, timezone

import jwt
import pytest
from sqlalchemy import text

from app import rate_limit, security
from app.config import settings
from tests.conftest import TEST_PASSWORD, create_admin


def login(client, email="editor@test.com", password=TEST_PASSWORD):
    return client.post("/auth/login", json={"email": email, "password": password})


def token_for(payload, key=None, algorithm=None):
    return jwt.encode(payload, key or settings.secret_key, algorithm=algorithm or settings.algorithm)


def in_one_hour():
    return datetime.now(timezone.utc) + timedelta(hours=1)


def get_me(client, token):
    return client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})


class FakeClock:
    def __init__(self):
        self.now = 1000.0

    def __call__(self):
        return self.now


# --- timing: the password is always checked ---

def test_unknown_email_still_checks_a_password_hash(client, monkeypatch):
    checked = []
    real_verify = security.verify_password

    def spy(plain, hashed):
        checked.append(hashed)
        return real_verify(plain, hashed)

    monkeypatch.setattr(security, "verify_password", spy)

    response = login(client, email="nobody@test.com")

    assert response.status_code == 401
    assert checked == [security.DUMMY_PASSWORD_HASH]


def test_unknown_email_and_wrong_password_give_the_same_answer(client, editor):
    unknown = login(client, email="nobody@test.com")
    wrong = login(client, password="wrong-password")

    assert unknown.status_code == wrong.status_code == 401
    assert unknown.json() == wrong.json()


def test_very_long_password_returns_401_not_500(client, editor):
    # bcrypt can't handle more than 72 bytes; this used to crash the login
    response = login(client, password="a" * 100)

    assert response.status_code == 401


# --- email capitals ---

def test_login_email_ignores_capitals_and_spaces(client, editor):
    response = login(client, email="  Editor@TEST.com ")

    assert response.status_code == 200


def test_new_admin_email_is_saved_in_lower_case(db_session, test_password_hash):
    admin = create_admin(db_session, " New.Admin@Test.COM", "editor", test_password_hash)

    assert admin.email == "new.admin@test.com"


def test_admin_saved_with_capitals_before_this_change_can_still_log_in(client, db_session, editor):
    # write capitals straight into the table, like an old row would have
    db_session.execute(text("UPDATE admins SET email = 'Editor@Test.com' WHERE id = :id"), {"id": editor.id})
    db_session.commit()

    response = login(client, email="editor@test.com")

    assert response.status_code == 200


# --- too many failed logins ---

def test_sixth_wrong_password_returns_429_with_retry_after(client, editor):
    for _ in range(5):
        assert login(client, password="wrong-password").status_code == 401

    response = login(client, password="wrong-password")

    assert response.status_code == 429
    assert int(response.headers["Retry-After"]) > 0
    assert "Too many failed login attempts" in response.json()["detail"]


def test_even_the_right_password_is_blocked_while_locked(client, editor):
    for _ in range(5):
        login(client, password="wrong-password")

    response = login(client)

    assert response.status_code == 429


def test_lock_is_per_email(client, editor, super_admin):
    for _ in range(5):
        login(client, password="wrong-password")

    response = login(client, email="super@test.com")

    assert response.status_code == 200


def test_lock_ends_after_15_minutes(client, editor, monkeypatch):
    clock = FakeClock()
    monkeypatch.setattr(rate_limit.login_failures_per_email, "clock", clock)
    monkeypatch.setattr(rate_limit.login_failures_per_ip, "clock", clock)
    for _ in range(5):
        login(client, password="wrong-password")
    assert login(client).status_code == 429

    clock.now += 15 * 60

    assert login(client).status_code == 200


def test_successful_login_clears_the_count(client, editor):
    for _ in range(4):
        login(client, password="wrong-password")
    assert login(client).status_code == 200

    # the count started again, so 4 more wrong passwords are still not blocked
    for _ in range(4):
        assert login(client, password="wrong-password").status_code == 401


def test_too_many_failures_from_one_address_across_emails_returns_429(client):
    # someone trying lots of different emails from the same address
    for number in range(20):
        login(client, email=f"guess{number}@test.com")

    response = login(client, email="another@test.com")

    assert response.status_code == 429


def test_unknown_emails_count_as_failures_too(client):
    for _ in range(5):
        login(client, email="nobody@test.com")

    response = login(client, email="nobody@test.com")

    assert response.status_code == 429


# --- token checks ---

def test_token_without_sub_returns_401(client, editor):
    token = token_for({"role": "editor", "exp": in_one_hour()})

    assert get_me(client, token).status_code == 401


def test_token_with_text_sub_returns_401(client, editor):
    token = token_for({"sub": "abc", "role": "editor", "exp": in_one_hour()})

    assert get_me(client, token).status_code == 401


def test_token_with_huge_sub_returns_401(client, editor):
    # bigger than the database's id column can hold; this used to be a 500
    token = token_for({"sub": "99999999999999999999", "role": "editor", "exp": in_one_hour()})

    assert get_me(client, token).status_code == 401


def test_token_with_number_sub_returns_401(client, editor):
    token = token_for({"sub": editor.id, "role": "editor", "exp": in_one_hour()})

    assert get_me(client, token).status_code == 401


def test_token_without_expiry_returns_401(client, editor):
    token = token_for({"sub": str(editor.id), "role": "editor"})

    assert get_me(client, token).status_code == 401


def test_token_with_alg_none_returns_401(client, editor):
    token = jwt.encode({"sub": str(editor.id), "role": "editor", "exp": in_one_hour()}, None, algorithm="none")

    assert get_me(client, token).status_code == 401


# PyJWT warns that our test key is short for HS512; that doesn't matter here
@pytest.mark.filterwarnings("ignore:The HMAC key")
def test_token_with_a_different_algorithm_returns_401(client, editor):
    # signed with the right key, but not with the one algorithm the server allows
    token = token_for({"sub": str(editor.id), "role": "editor", "exp": in_one_hour()}, algorithm="HS512")

    assert get_me(client, token).status_code == 401


def test_token_for_an_admin_that_does_not_exist_returns_401(client):
    token = token_for({"sub": "4242", "role": "super_admin", "exp": in_one_hour()})

    assert get_me(client, token).status_code == 401
