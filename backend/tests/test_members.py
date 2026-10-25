MEMBER = {
    "full_name": "Ada Okafor",
    "phone": "08012345678",
}


def register(client, **changes):
    payload = {**MEMBER, **changes}
    return client.post("/members", json=payload)


# --- registering (public, no login) ---

def test_anyone_can_register_with_name_and_phone(client):
    response = register(client)

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["full_name"] == "Ada Okafor"
    assert body["phone"] == "08012345678"
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
        birthday="2004-05-17",
        joined_whatsapp_consent=True,
    )

    assert response.status_code == 201
    body = response.json()
    assert body["department"] == "Computer Science"
    assert body["level"] == "300L"
    assert body["birthday"] == "2004-05-17"
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
