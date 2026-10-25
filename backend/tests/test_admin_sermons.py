SERMON = {
    "title": "Walking by Faith",
    "preacher": "Pastor John",
    "preached_on": "2026-10-18",
}


def create_sermon(client, headers, **changes):
    payload = {**SERMON, **changes}
    return client.post("/sermons", json=payload, headers=headers)


# --- who is allowed ---

def test_create_sermon_without_token_returns_401(client):
    response = client.post("/sermons", json=SERMON)

    assert response.status_code == 401


def test_create_sermon_as_viewer_returns_403(client, viewer_headers):
    response = create_sermon(client, viewer_headers)

    assert response.status_code == 403


def test_editor_can_create_sermon(client, editor_headers):
    response = create_sermon(client, editor_headers)

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["title"] == "Walking by Faith"
    assert body["preacher"] == "Pastor John"
    assert body["preached_on"] == "2026-10-18"


def test_super_admin_can_create_sermon(client, super_admin_headers):
    response = create_sermon(client, super_admin_headers)

    assert response.status_code == 201


# --- creating ---

def test_create_sermon_without_preacher_returns_422(client, editor_headers):
    payload = dict(SERMON)
    del payload["preacher"]

    response = client.post("/sermons", json=payload, headers=editor_headers)

    assert response.status_code == 422


def test_new_sermon_appears_in_public_list(client, editor_headers):
    create_sermon(client, editor_headers)

    response = client.get("/sermons")

    assert len(response.json()) == 1
    assert response.json()[0]["title"] == SERMON["title"]


# --- updating ---

def test_update_sermon_changes_only_the_sent_field(client, editor_headers):
    sermon_id = create_sermon(client, editor_headers).json()["id"]

    response = client.patch(f"/sermons/{sermon_id}", json={"title": "Grace Abounds"}, headers=editor_headers)

    assert response.status_code == 200
    assert response.json()["title"] == "Grace Abounds"
    assert response.json()["preacher"] == SERMON["preacher"]


def test_update_sermon_as_viewer_returns_403(client, editor_headers, viewer_headers):
    sermon_id = create_sermon(client, editor_headers).json()["id"]

    response = client.patch(f"/sermons/{sermon_id}", json={"title": "Grace Abounds"}, headers=viewer_headers)

    assert response.status_code == 403


def test_update_unknown_sermon_returns_404(client, editor_headers):
    response = client.patch("/sermons/9999", json={"title": "Grace Abounds"}, headers=editor_headers)

    assert response.status_code == 404


# --- deleting ---

def test_delete_sermon_returns_204_and_then_it_is_gone(client, editor_headers):
    sermon_id = create_sermon(client, editor_headers).json()["id"]

    response = client.delete(f"/sermons/{sermon_id}", headers=editor_headers)

    assert response.status_code == 204
    assert client.get(f"/sermons/{sermon_id}").status_code == 404


def test_delete_sermon_twice_returns_404(client, editor_headers):
    sermon_id = create_sermon(client, editor_headers).json()["id"]
    client.delete(f"/sermons/{sermon_id}", headers=editor_headers)

    response = client.delete(f"/sermons/{sermon_id}", headers=editor_headers)

    assert response.status_code == 404


def test_delete_sermon_as_viewer_returns_403(client, editor_headers, viewer_headers):
    sermon_id = create_sermon(client, editor_headers).json()["id"]

    response = client.delete(f"/sermons/{sermon_id}", headers=viewer_headers)

    assert response.status_code == 403
    assert len(client.get("/sermons").json()) == 1


def test_delete_unknown_sermon_returns_404(client, editor_headers):
    response = client.delete("/sermons/9999", headers=editor_headers)

    assert response.status_code == 404
