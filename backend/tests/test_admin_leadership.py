LEADER = {
    "name": "Pastor Grace Okafor",
    "role": "Senior Pastor",
}


def create_leader(client, headers, **changes):
    payload = {**LEADER, **changes}
    return client.post("/leadership", json=payload, headers=headers)


# --- who is allowed ---

def test_create_leader_without_token_returns_401(client):
    response = client.post("/leadership", json=LEADER)

    assert response.status_code == 401


def test_create_leader_as_viewer_returns_403(client, viewer_headers):
    response = create_leader(client, viewer_headers)

    assert response.status_code == 403


def test_editor_can_create_leader(client, editor_headers):
    response = create_leader(client, editor_headers)

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["name"] == "Pastor Grace Okafor"
    assert body["role"] == "Senior Pastor"


def test_super_admin_can_create_leader(client, super_admin_headers):
    response = create_leader(client, super_admin_headers)

    assert response.status_code == 201


# --- creating ---

def test_create_leader_without_name_returns_422(client, editor_headers):
    payload = dict(LEADER)
    del payload["name"]

    response = client.post("/leadership", json=payload, headers=editor_headers)

    assert response.status_code == 422


def test_new_leader_appears_in_public_list(client, editor_headers):
    create_leader(client, editor_headers)

    response = client.get("/leadership")

    assert len(response.json()) == 1
    assert response.json()[0]["name"] == LEADER["name"]


def test_new_leader_gets_display_order_0_by_default(client, editor_headers):
    response = create_leader(client, editor_headers)

    assert response.json()["display_order"] == 0


def test_new_leader_can_set_display_order(client, editor_headers):
    response = create_leader(client, editor_headers, display_order=3)

    assert response.json()["display_order"] == 3


# --- updating ---

def test_update_leader_changes_only_the_sent_field(client, editor_headers):
    leader_id = create_leader(client, editor_headers).json()["id"]

    response = client.patch(f"/leadership/{leader_id}", json={"name": "Pastor Grace O."}, headers=editor_headers)

    assert response.status_code == 200
    assert response.json()["name"] == "Pastor Grace O."
    assert response.json()["role"] == LEADER["role"]


def test_update_leader_as_viewer_returns_403(client, editor_headers, viewer_headers):
    leader_id = create_leader(client, editor_headers).json()["id"]

    response = client.patch(f"/leadership/{leader_id}", json={"name": "Pastor Grace O."}, headers=viewer_headers)

    assert response.status_code == 403


def test_update_unknown_leader_returns_404(client, editor_headers):
    response = client.patch("/leadership/9999", json={"name": "Pastor Grace O."}, headers=editor_headers)

    assert response.status_code == 404


# --- deleting ---

def test_delete_leader_returns_204_and_then_it_is_gone(client, editor_headers):
    leader_id = create_leader(client, editor_headers).json()["id"]

    response = client.delete(f"/leadership/{leader_id}", headers=editor_headers)

    assert response.status_code == 204
    assert client.get(f"/leadership/{leader_id}").status_code == 404


def test_delete_leader_twice_returns_404(client, editor_headers):
    leader_id = create_leader(client, editor_headers).json()["id"]
    client.delete(f"/leadership/{leader_id}", headers=editor_headers)

    response = client.delete(f"/leadership/{leader_id}", headers=editor_headers)

    assert response.status_code == 404


def test_delete_leader_as_viewer_returns_403(client, editor_headers, viewer_headers):
    leader_id = create_leader(client, editor_headers).json()["id"]

    response = client.delete(f"/leadership/{leader_id}", headers=viewer_headers)

    assert response.status_code == 403
    assert len(client.get("/leadership").json()) == 1


def test_delete_unknown_leader_returns_404(client, editor_headers):
    response = client.delete("/leadership/9999", headers=editor_headers)

    assert response.status_code == 404
