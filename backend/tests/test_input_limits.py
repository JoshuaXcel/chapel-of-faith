from datetime import date, datetime, timedelta

import pytest

NEXT_MONTH = (datetime.now() + timedelta(days=30)).replace(microsecond=0).isoformat()

# a valid example for each admin form
EXAMPLES = {
    "/events": {"title": "Youth Revival", "location": "Main Auditorium", "starts_at": NEXT_MONTH},
    "/sermons": {"title": "Faith", "preacher": "Pastor Ade", "preached_on": "2026-01-04"},
    "/devotions": {"title": "Morning", "scripture": "Psalm 23", "body": "Text", "devotion_date": "2026-01-04"},
    "/leadership": {"name": "Pastor Ade", "role": "Chaplain"},
    "/gallery": {"image_url": "/media/choir.jpg"},
}

# (form, field, longest allowed length)
LIMITS = [
    ("/events", "title", 200),
    ("/events", "location", 200),
    ("/events", "description", 10_000),
    ("/sermons", "title", 255),
    ("/sermons", "preacher", 120),
    ("/sermons", "scripture", 120),
    ("/sermons", "description", 10_000),
    ("/devotions", "title", 200),
    ("/devotions", "scripture", 120),
    ("/devotions", "body", 10_000),
    ("/devotions", "author", 120),
    ("/leadership", "name", 120),
    ("/leadership", "role", 120),
    ("/leadership", "bio", 10_000),
    ("/gallery", "caption", 255),
]

LINK_FIELDS = [
    ("/events", "image_url"),
    ("/sermons", "audio_url"),
    ("/leadership", "photo_url"),
    ("/gallery", "image_url"),
]


@pytest.mark.parametrize("path, field, limit", LIMITS)
def test_text_at_the_limit_is_accepted(client, editor_headers, path, field, limit):
    payload = {**EXAMPLES[path], field: "a" * limit}

    response = client.post(path, json=payload, headers=editor_headers)

    assert response.status_code == 201


@pytest.mark.parametrize("path, field, limit", LIMITS)
def test_text_over_the_limit_returns_422(client, editor_headers, path, field, limit):
    payload = {**EXAMPLES[path], field: "a" * (limit + 1)}

    response = client.post(path, json=payload, headers=editor_headers)

    assert response.status_code == 422


@pytest.mark.parametrize("path, field, limit", LIMITS)
def test_update_over_the_limit_returns_422(client, editor_headers, path, field, limit):
    item_id = client.post(path, json=EXAMPLES[path], headers=editor_headers).json()["id"]

    response = client.patch(f"{path}/{item_id}", json={field: "a" * (limit + 1)}, headers=editor_headers)

    assert response.status_code == 422


@pytest.mark.parametrize("path", ["/events", "/sermons", "/devotions", "/leadership"])
def test_empty_required_title_or_name_returns_422(client, editor_headers, path):
    field = "name" if path == "/leadership" else "title"
    payload = {**EXAMPLES[path], field: ""}

    response = client.post(path, json=payload, headers=editor_headers)

    assert response.status_code == 422


@pytest.mark.parametrize("path, field", LINK_FIELDS)
@pytest.mark.parametrize("link", ["https://example.com/photo.jpg", "http://example.com/a.mp3", "/media/abc.png"])
def test_web_links_and_uploaded_files_are_accepted(client, editor_headers, path, field, link):
    payload = {**EXAMPLES[path], field: link}

    response = client.post(path, json=payload, headers=editor_headers)

    assert response.status_code == 201


@pytest.mark.parametrize("path, field", LINK_FIELDS)
@pytest.mark.parametrize("link", ["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "ftp://example.com/a"])
def test_other_kinds_of_links_return_422(client, editor_headers, path, field, link):
    payload = {**EXAMPLES[path], field: link}

    response = client.post(path, json=payload, headers=editor_headers)

    assert response.status_code == 422


@pytest.mark.parametrize("path, field", LINK_FIELDS)
def test_link_longer_than_500_characters_returns_422(client, editor_headers, path, field):
    payload = {**EXAMPLES[path], field: "https://example.com/" + "a" * 481}

    response = client.post(path, json=payload, headers=editor_headers)

    assert response.status_code == 422


# --- login form ---

def test_login_password_longer_than_128_characters_returns_422(client, editor):
    response = client.post("/auth/login", json={"email": "editor@test.com", "password": "a" * 129})

    assert response.status_code == 422


def test_login_email_longer_than_255_characters_returns_422(client):
    response = client.post("/auth/login", json={"email": "a" * 250 + "@x.com", "password": "x"})

    assert response.status_code == 422
