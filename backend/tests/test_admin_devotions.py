DEVOTION = {
    "title": "Strength for Today",
    "scripture": "Isaiah 40:31",
    "body": "Those who wait on the Lord shall renew their strength.",
    "devotion_date": "2026-11-01",
}


def create_devotion(client, headers, **changes):
    payload = {**DEVOTION, **changes}
    return client.post("/devotions", json=payload, headers=headers)


# --- who is allowed ---

def test_create_devotion_without_token_returns_401(client):
    response = client.post("/devotions", json=DEVOTION)

    assert response.status_code == 401


def test_create_devotion_as_viewer_returns_403(client, viewer_headers):
    response = create_devotion(client, viewer_headers)

    assert response.status_code == 403


def test_editor_can_create_devotion(client, editor_headers):
    response = create_devotion(client, editor_headers)

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["title"] == "Strength for Today"
    assert body["devotion_date"] == "2026-11-01"
    assert body["author"] is None


def test_super_admin_can_create_devotion(client, super_admin_headers):
    response = create_devotion(client, super_admin_headers)

    assert response.status_code == 201


# --- creating ---

def test_create_devotion_without_devotion_date_returns_422(client, editor_headers):
    payload = dict(DEVOTION)
    del payload["devotion_date"]

    response = client.post("/devotions", json=payload, headers=editor_headers)

    assert response.status_code == 422


def test_new_devotion_appears_in_public_list(client, editor_headers):
    create_devotion(client, editor_headers)

    response = client.get("/devotions")

    assert len(response.json()) == 1
    assert response.json()[0]["title"] == DEVOTION["title"]


def test_create_devotion_with_a_date_that_is_taken_returns_409(client, editor_headers):
    create_devotion(client, editor_headers)

    response = create_devotion(client, editor_headers, title="Another one")

    assert response.status_code == 409
    assert response.json()["detail"] == "A devotion for that date already exists"


def test_api_still_works_after_a_409(client, editor_headers):
    create_devotion(client, editor_headers)
    create_devotion(client, editor_headers)  # 409, the session must recover

    response = create_devotion(client, editor_headers, devotion_date="2026-11-02")

    assert response.status_code == 201
    assert len(client.get("/devotions").json()) == 2


# --- updating ---

def test_update_devotion_changes_only_the_sent_field(client, editor_headers):
    devotion_id = create_devotion(client, editor_headers).json()["id"]

    response = client.patch(f"/devotions/{devotion_id}", json={"title": "Peace Be Still"}, headers=editor_headers)

    assert response.status_code == 200
    assert response.json()["title"] == "Peace Be Still"
    assert response.json()["scripture"] == DEVOTION["scripture"]


def test_update_devotion_as_viewer_returns_403(client, editor_headers, viewer_headers):
    devotion_id = create_devotion(client, editor_headers).json()["id"]

    response = client.patch(f"/devotions/{devotion_id}", json={"title": "Peace Be Still"}, headers=viewer_headers)

    assert response.status_code == 403


def test_update_unknown_devotion_returns_404(client, editor_headers):
    response = client.patch("/devotions/9999", json={"title": "Peace Be Still"}, headers=editor_headers)

    assert response.status_code == 404


def test_update_devotion_to_a_date_that_is_taken_returns_409(client, editor_headers):
    create_devotion(client, editor_headers, devotion_date="2026-11-01")
    second_id = create_devotion(client, editor_headers, devotion_date="2026-11-02").json()["id"]

    response = client.patch(f"/devotions/{second_id}", json={"devotion_date": "2026-11-01"}, headers=editor_headers)

    assert response.status_code == 409
    # the second devotion keeps its own date
    assert client.get(f"/devotions/{second_id}").json()["devotion_date"] == "2026-11-02"


# --- deleting ---

def test_delete_devotion_returns_204_and_then_it_is_gone(client, editor_headers):
    devotion_id = create_devotion(client, editor_headers).json()["id"]

    response = client.delete(f"/devotions/{devotion_id}", headers=editor_headers)

    assert response.status_code == 204
    assert client.get(f"/devotions/{devotion_id}").status_code == 404


def test_delete_devotion_twice_returns_404(client, editor_headers):
    devotion_id = create_devotion(client, editor_headers).json()["id"]
    client.delete(f"/devotions/{devotion_id}", headers=editor_headers)

    response = client.delete(f"/devotions/{devotion_id}", headers=editor_headers)

    assert response.status_code == 404


def test_delete_devotion_as_viewer_returns_403(client, editor_headers, viewer_headers):
    devotion_id = create_devotion(client, editor_headers).json()["id"]

    response = client.delete(f"/devotions/{devotion_id}", headers=viewer_headers)

    assert response.status_code == 403
    assert len(client.get("/devotions").json()) == 1


def test_delete_unknown_devotion_returns_404(client, editor_headers):
    response = client.delete("/devotions/9999", headers=editor_headers)

    assert response.status_code == 404
