# Sending null for a field the database requires (for example {"title": null})
# must be rejected with 422, and the record must stay unchanged.
from datetime import datetime, timedelta

NEXT_MONTH = (datetime.now() + timedelta(days=30)).replace(microsecond=0)


def test_event_title_cannot_be_set_to_null(client, editor_headers):
    event = {"title": "Youth Revival", "location": "Main Auditorium", "starts_at": NEXT_MONTH.isoformat()}
    event_id = client.post("/events", json=event, headers=editor_headers).json()["id"]

    response = client.patch(f"/events/{event_id}", json={"title": None}, headers=editor_headers)

    assert response.status_code == 422
    assert client.get(f"/events/{event_id}").json()["title"] == "Youth Revival"


def test_event_starts_at_cannot_be_set_to_null(client, editor_headers):
    event = {"title": "Youth Revival", "location": "Main Auditorium", "starts_at": NEXT_MONTH.isoformat()}
    event_id = client.post("/events", json=event, headers=editor_headers).json()["id"]

    response = client.patch(f"/events/{event_id}", json={"starts_at": None}, headers=editor_headers)

    assert response.status_code == 422


def test_event_description_can_still_be_cleared_with_null(client, editor_headers):
    event = {"title": "Youth Revival", "location": "Hall", "starts_at": NEXT_MONTH.isoformat(), "description": "Bring a friend"}
    event_id = client.post("/events", json=event, headers=editor_headers).json()["id"]

    response = client.patch(f"/events/{event_id}", json={"description": None}, headers=editor_headers)

    assert response.status_code == 200
    assert response.json()["description"] is None


def test_sermon_title_cannot_be_set_to_null(client, editor_headers):
    sermon = {"title": "Walking by Faith", "preacher": "Pastor John", "preached_on": "2026-10-18"}
    sermon_id = client.post("/sermons", json=sermon, headers=editor_headers).json()["id"]

    response = client.patch(f"/sermons/{sermon_id}", json={"title": None}, headers=editor_headers)

    assert response.status_code == 422
    assert client.get(f"/sermons/{sermon_id}").json()["title"] == "Walking by Faith"


def test_devotion_title_cannot_be_set_to_null(client, editor_headers):
    devotion = {"title": "Strength for Today", "scripture": "Isaiah 40:31", "body": "Text", "devotion_date": "2026-11-01"}
    devotion_id = client.post("/devotions", json=devotion, headers=editor_headers).json()["id"]

    response = client.patch(f"/devotions/{devotion_id}", json={"title": None}, headers=editor_headers)

    assert response.status_code == 422
    assert client.get(f"/devotions/{devotion_id}").json()["title"] == "Strength for Today"


def test_devotion_date_null_gives_422_not_409(client, editor_headers):
    devotion = {"title": "Strength for Today", "scripture": "Isaiah 40:31", "body": "Text", "devotion_date": "2026-11-01"}
    devotion_id = client.post("/devotions", json=devotion, headers=editor_headers).json()["id"]

    response = client.patch(f"/devotions/{devotion_id}", json={"devotion_date": None}, headers=editor_headers)

    assert response.status_code == 422


def test_leader_name_cannot_be_set_to_null(client, editor_headers):
    leader = {"name": "Pastor Grace Okafor", "role": "Senior Pastor"}
    leader_id = client.post("/leadership", json=leader, headers=editor_headers).json()["id"]

    response = client.patch(f"/leadership/{leader_id}", json={"name": None}, headers=editor_headers)

    assert response.status_code == 422
    assert client.get(f"/leadership/{leader_id}").json()["name"] == "Pastor Grace Okafor"


def test_leader_display_order_cannot_be_set_to_null(client, editor_headers):
    leader = {"name": "Pastor Grace Okafor", "role": "Senior Pastor", "display_order": 2}
    leader_id = client.post("/leadership", json=leader, headers=editor_headers).json()["id"]

    response = client.patch(f"/leadership/{leader_id}", json={"display_order": None}, headers=editor_headers)

    assert response.status_code == 422
    assert client.get(f"/leadership/{leader_id}").json()["display_order"] == 2


def test_gallery_image_url_cannot_be_set_to_null(client, editor_headers):
    image = {"image_url": "/media/choir.jpg", "caption": "Choir"}
    image_id = client.post("/gallery", json=image, headers=editor_headers).json()["id"]

    response = client.patch(f"/gallery/{image_id}", json={"image_url": None}, headers=editor_headers)

    assert response.status_code == 422
    assert client.get("/gallery").json()[0]["image_url"] == "/media/choir.jpg"
