from datetime import datetime, timedelta

# events in the past are hidden from the public list, so we use a future date
NEXT_MONTH = (datetime.now() + timedelta(days=30)).replace(microsecond=0)

EVENT = {
    "title": "Youth Revival",
    "location": "Main Auditorium",
    "starts_at": NEXT_MONTH.isoformat(),
}


def create_event(client, headers, **changes):
    payload = {**EVENT, **changes}
    return client.post("/events", json=payload, headers=headers)


# --- who is allowed ---

def test_create_event_without_token_returns_401(client):
    response = client.post("/events", json=EVENT)

    assert response.status_code == 401


def test_create_event_as_viewer_returns_403(client, viewer_headers):
    response = create_event(client, viewer_headers)

    assert response.status_code == 403


def test_editor_can_create_event(client, editor_headers):
    response = create_event(client, editor_headers)

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["title"] == "Youth Revival"
    assert body["location"] == "Main Auditorium"
    assert body["description"] is None


def test_super_admin_can_create_event(client, super_admin_headers):
    response = create_event(client, super_admin_headers)

    assert response.status_code == 201


# --- creating ---

def test_create_event_without_title_returns_422(client, editor_headers):
    payload = dict(EVENT)
    del payload["title"]

    response = client.post("/events", json=payload, headers=editor_headers)

    assert response.status_code == 422


def test_new_event_appears_in_public_list(client, editor_headers):
    create_event(client, editor_headers)

    response = client.get("/events")

    assert len(response.json()) == 1
    assert response.json()[0]["title"] == EVENT["title"]


# --- updating ---

def test_update_event_changes_only_the_sent_field(client, editor_headers):
    event_id = create_event(client, editor_headers).json()["id"]

    response = client.patch(f"/events/{event_id}", json={"title": "Prayer Night"}, headers=editor_headers)

    assert response.status_code == 200
    assert response.json()["title"] == "Prayer Night"
    assert response.json()["location"] == EVENT["location"]


def test_update_event_as_viewer_returns_403(client, editor_headers, viewer_headers):
    event_id = create_event(client, editor_headers).json()["id"]

    response = client.patch(f"/events/{event_id}", json={"title": "Prayer Night"}, headers=viewer_headers)

    assert response.status_code == 403


def test_update_unknown_event_returns_404(client, editor_headers):
    response = client.patch("/events/9999", json={"title": "Prayer Night"}, headers=editor_headers)

    assert response.status_code == 404


# --- deleting ---

def test_delete_event_returns_204_and_then_it_is_gone(client, editor_headers):
    event_id = create_event(client, editor_headers).json()["id"]

    response = client.delete(f"/events/{event_id}", headers=editor_headers)

    assert response.status_code == 204
    assert client.get(f"/events/{event_id}").status_code == 404


def test_delete_event_twice_returns_404(client, editor_headers):
    event_id = create_event(client, editor_headers).json()["id"]
    client.delete(f"/events/{event_id}", headers=editor_headers)

    response = client.delete(f"/events/{event_id}", headers=editor_headers)

    assert response.status_code == 404


def test_delete_event_as_viewer_returns_403(client, editor_headers, viewer_headers):
    event_id = create_event(client, editor_headers).json()["id"]

    response = client.delete(f"/events/{event_id}", headers=viewer_headers)

    assert response.status_code == 403
    assert len(client.get("/events").json()) == 1


def test_delete_unknown_event_returns_404(client, editor_headers):
    response = client.delete("/events/9999", headers=editor_headers)

    assert response.status_code == 404
