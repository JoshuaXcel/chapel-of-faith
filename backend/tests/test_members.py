from datetime import date

import pytest

from app import rate_limit


MEMBER = {
    "full_name": "Ada Okafor",
    "phone": "08012345678",
    "member_type": "undergraduate",
    "birth_day": 17,
    "birth_month": 5,
}


def register(client, **changes):
    payload = {**MEMBER, **changes}
    return client.post("/members", json=payload)


# --- registering (public, no login) ---

def test_anyone_can_register_with_only_the_required_fields(client):
    response = register(client)

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["full_name"] == "Ada Okafor"
    assert body["phone"] == "08012345678"
    assert body["member_type"] == "undergraduate"
    assert body["birth_day"] == 17
    assert body["birth_month"] == 5
    assert body["birth_year"] is None
    assert body["email"] is None
    assert body["joined_whatsapp_consent"] is False
    assert body["created_at"]


def test_register_with_all_fields(client):
    response = register(
        client,
        email="ada@example.com",
        gender="Female",
        department="Computer Science",
        level="300L",
        hostel_or_address="Jadesola Hall",
        birth_year=2004,
        joined_whatsapp_consent=True,
    )

    assert response.status_code == 201
    body = response.json()
    assert body["department"] == "Computer Science"
    assert body["level"] == "300L"
    assert body["birth_year"] == 2004
    assert body["joined_whatsapp_consent"] is True


def test_register_without_name_returns_422(client):
    payload = dict(MEMBER)
    del payload["full_name"]

    response = client.post("/members", json=payload)

    assert response.status_code == 422


def test_register_without_phone_returns_422(client):
    payload = dict(MEMBER)
    del payload["phone"]

    response = client.post("/members", json=payload)

    assert response.status_code == 422


def test_register_with_blank_name_returns_422(client):
    response = register(client, full_name="   ")

    assert response.status_code == 422


def test_register_with_too_long_phone_returns_422(client):
    response = register(client, phone="1" * 31)

    assert response.status_code == 422


# --- birthday: day + month required, year optional ---

def test_register_without_birth_day_returns_422(client):
    payload = dict(MEMBER)
    del payload["birth_day"]

    response = client.post("/members", json=payload)

    assert response.status_code == 422


def test_register_without_birth_month_returns_422(client):
    payload = dict(MEMBER)
    del payload["birth_month"]

    response = client.post("/members", json=payload)

    assert response.status_code == 422


def test_register_with_month_13_returns_422(client):
    response = register(client, birth_month=13)

    assert response.status_code == 422


def test_register_with_31_april_returns_422(client):
    response = register(client, birth_day=31, birth_month=4)

    assert response.status_code == 422
    assert "31 April is not a real date" in response.text


def test_register_with_30_february_returns_422(client):
    response = register(client, birth_day=30, birth_month=2)

    assert response.status_code == 422


def test_register_with_29_february_and_no_year_is_ok(client):
    response = register(client, birth_day=29, birth_month=2)

    assert response.status_code == 201
    assert response.json()["birth_year"] is None


def test_register_with_29_february_in_a_leap_year_is_ok(client):
    response = register(client, birth_day=29, birth_month=2, birth_year=2004)

    assert response.status_code == 201


def test_register_with_29_february_in_a_normal_year_returns_422(client):
    response = register(client, birth_day=29, birth_month=2, birth_year=2003)

    assert response.status_code == 422
    assert "29 February 2003 is not a real date" in response.text


def test_register_with_year_before_1900_returns_422(client):
    response = register(client, birth_year=1899)

    assert response.status_code == 422


def test_register_with_future_year_returns_422(client):
    response = register(client, birth_year=date.today().year + 1)

    assert response.status_code == 422


# --- member type: undergraduate, graduate, staff or other ---

def test_register_without_member_type_returns_422(client):
    payload = dict(MEMBER)
    del payload["member_type"]

    response = client.post("/members", json=payload)

    assert response.status_code == 422


def test_register_with_unknown_member_type_returns_422(client):
    response = register(client, member_type="student")

    assert response.status_code == 422


def test_register_with_unknown_level_returns_422(client):
    response = register(client, level="600L")

    assert response.status_code == 422


def test_level_is_dropped_for_graduates(client):
    response = register(client, member_type="graduate", department="Physics", level="200L")

    assert response.status_code == 201
    body = response.json()
    assert body["member_type"] == "graduate"
    assert body["department"] == "Physics"
    assert body["level"] is None


def test_level_is_dropped_for_staff(client):
    response = register(client, member_type="staff", department="Bursary", level="100L")

    assert response.status_code == 201
    assert response.json()["level"] is None


def test_department_and_level_are_dropped_for_other(client):
    response = register(client, member_type="other", department="Physics", level="100L")

    assert response.status_code == 201
    body = response.json()
    assert body["department"] is None
    assert body["level"] is None


# --- listing (admin only) ---

def test_list_members_without_token_returns_401(client):
    response = client.get("/members")

    assert response.status_code == 401


def test_list_members_as_viewer_returns_403(client, viewer_headers):
    response = client.get("/members", headers=viewer_headers)

    assert response.status_code == 403


def test_admin_can_list_members_newest_first(client, editor_headers):
    register(client, full_name="First Person")
    register(client, full_name="Second Person")

    response = client.get("/members", headers=editor_headers)

    assert response.status_code == 200
    names = [member["full_name"] for member in response.json()]
    assert names == ["Second Person", "First Person"]


def test_list_members_returns_birthday_and_member_type(client, editor_headers):
    register(client, member_type="staff", department="Library", birth_day=12, birth_month=3, birth_year=1990)

    member = client.get("/members", headers=editor_headers).json()[0]

    assert member["member_type"] == "staff"
    assert member["department"] == "Library"
    assert member["level"] is None
    assert member["birth_day"] == 12
    assert member["birth_month"] == 3
    assert member["birth_year"] == 1990


# --- deleting (admin only) ---

def test_delete_member_without_token_returns_401(client):
    member_id = register(client).json()["id"]

    response = client.delete(f"/members/{member_id}")

    assert response.status_code == 401


def test_admin_can_delete_member(client, super_admin_headers):
    member_id = register(client).json()["id"]

    response = client.delete(f"/members/{member_id}", headers=super_admin_headers)

    assert response.status_code == 204
    remaining = client.get("/members", headers=super_admin_headers).json()
    assert remaining == []


def test_delete_missing_member_returns_404(client, editor_headers):
    response = client.delete("/members/999", headers=editor_headers)

    assert response.status_code == 404


# --- size limits and email ---

@pytest.mark.parametrize("field, limit", [
    ("full_name", 120), ("phone", 30), ("gender", 20), ("department", 120), ("hostel_or_address", 255),
])
def test_register_with_too_long_text_returns_422(client, field, limit):
    response = register(client, **{field: "a" * (limit + 1)})

    assert response.status_code == 422


def test_register_with_invalid_email_returns_422(client):
    response = register(client, email="not-an-email")

    assert response.status_code == 422


def test_register_with_valid_email_is_ok(client):
    response = register(client, email="ada@gmail.com")

    assert response.status_code == 201
    assert response.json()["email"] == "ada@gmail.com"


def test_register_with_no_email_is_ok(client):
    response = register(client, email=None)

    assert response.status_code == 201


# --- too many sign-ups ---

def test_too_many_sign_ups_from_one_address_returns_429(client, monkeypatch):
    # a small limit so the test is quick (the real one is 30 per 10 minutes)
    monkeypatch.setattr(rate_limit.member_signups_per_ip, "max_attempts", 3)
    for _ in range(3):
        assert register(client).status_code == 201

    response = register(client)

    assert response.status_code == 429
    assert int(response.headers["Retry-After"]) > 0
    assert "Too many sign-ups" in response.json()["detail"]


def test_sign_ups_are_allowed_again_after_the_window(client, monkeypatch):
    now = [1000.0]
    monkeypatch.setattr(rate_limit.member_signups_per_ip, "max_attempts", 3)
    monkeypatch.setattr(rate_limit.member_signups_per_ip, "clock", lambda: now[0])
    for _ in range(3):
        register(client)
    assert register(client).status_code == 429

    now[0] += 10 * 60

    assert register(client).status_code == 201


def test_real_sign_up_limit_is_generous_enough_for_a_sign_up_drive():
    assert rate_limit.member_signups_per_ip.max_attempts >= 30
