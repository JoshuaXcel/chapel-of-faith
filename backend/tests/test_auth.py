from datetime import datetime, timedelta, timezone

import jwt

from app.config import settings
from tests.conftest import TEST_PASSWORD


def test_login_with_correct_password_returns_a_token(client, editor):
    response = client.post("/auth/login", json={"email": "editor@test.com", "password": TEST_PASSWORD})

    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["token_type"] == "bearer"


def test_login_token_works_on_auth_me(client, editor):
    login = client.post("/auth/login", json={"email": "editor@test.com", "password": TEST_PASSWORD})
    token = login.json()["access_token"]

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["email"] == "editor@test.com"
    assert response.json()["role"] == "editor"


def test_auth_me_does_not_show_the_password_hash(client, editor_headers):
    response = client.get("/auth/me", headers=editor_headers)

    assert response.status_code == 200
    assert "password_hash" not in response.json()


def test_login_with_wrong_password_returns_401(client, editor):
    response = client.post("/auth/login", json={"email": "editor@test.com", "password": "wrong-password"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_with_unknown_email_returns_401(client):
    response = client.post("/auth/login", json={"email": "nobody@test.com", "password": TEST_PASSWORD})

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_for_inactive_admin_returns_401(client, db_session, editor):
    editor.is_active = False
    db_session.commit()

    response = client.post("/auth/login", json={"email": "editor@test.com", "password": TEST_PASSWORD})

    assert response.status_code == 401


def test_login_without_password_returns_422(client):
    response = client.post("/auth/login", json={"email": "editor@test.com"})

    assert response.status_code == 422


def test_auth_me_without_token_returns_401(client):
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_auth_me_with_garbage_token_returns_401(client):
    response = client.get("/auth/me", headers={"Authorization": "Bearer not-a-real-token"})

    assert response.status_code == 401


def test_auth_me_with_expired_token_returns_401(client, editor):
    # build a token that expired one minute ago
    expired = datetime.now(timezone.utc) - timedelta(minutes=1)
    payload = {"sub": str(editor.id), "role": editor.role, "exp": expired}
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_auth_me_with_token_signed_by_wrong_key_returns_401(client, editor):
    payload = {"sub": str(editor.id), "role": "super_admin"}
    token = jwt.encode(payload, "someone-elses-secret-key-0123456789", algorithm=settings.algorithm)

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_token_stops_working_when_admin_is_deactivated(client, db_session, editor, editor_headers):
    editor.is_active = False
    db_session.commit()

    response = client.get("/auth/me", headers=editor_headers)

    assert response.status_code == 401


def test_admin_route_without_token_returns_401(client):
    response = client.post("/events", json={})

    assert response.status_code == 401


def test_admin_route_with_garbage_token_returns_401(client):
    response = client.post("/events", json={}, headers={"Authorization": "Bearer not-a-real-token"})

    assert response.status_code == 401
