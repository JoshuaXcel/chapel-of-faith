IMAGE = {
    "image_url": "/media/choir.jpg",
    "caption": "Choir on Sunday",
}


def create_gallery_image(client, headers, **changes):
    payload = {**IMAGE, **changes}
    return client.post("/gallery", json=payload, headers=headers)


# --- who is allowed ---

def test_create_gallery_image_without_token_returns_401(client):
    response = client.post("/gallery", json=IMAGE)

    assert response.status_code == 401


def test_create_gallery_image_as_viewer_returns_403(client, viewer_headers):
    response = create_gallery_image(client, viewer_headers)

    assert response.status_code == 403


def test_editor_can_create_gallery_image(client, editor_headers):
    response = create_gallery_image(client, editor_headers)

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["image_url"] == "/media/choir.jpg"
    assert body["caption"] == "Choir on Sunday"


def test_super_admin_can_create_gallery_image(client, super_admin_headers):
    response = create_gallery_image(client, super_admin_headers)

    assert response.status_code == 201


# --- creating ---

def test_create_gallery_image_without_image_url_returns_422(client, editor_headers):
    payload = dict(IMAGE)
    del payload["image_url"]

    response = client.post("/gallery", json=payload, headers=editor_headers)

    assert response.status_code == 422


def test_new_gallery_image_appears_in_public_list(client, editor_headers):
    create_gallery_image(client, editor_headers)

    response = client.get("/gallery")

    assert len(response.json()) == 1
    assert response.json()[0]["caption"] == IMAGE["caption"]


# --- updating ---

def test_update_gallery_image_changes_only_the_sent_field(client, editor_headers):
    image_id = create_gallery_image(client, editor_headers).json()["id"]

    response = client.patch(f"/gallery/{image_id}", json={"caption": "Choir at Easter"}, headers=editor_headers)

    assert response.status_code == 200
    assert response.json()["caption"] == "Choir at Easter"
    assert response.json()["image_url"] == IMAGE["image_url"]


def test_update_gallery_image_as_viewer_returns_403(client, editor_headers, viewer_headers):
    image_id = create_gallery_image(client, editor_headers).json()["id"]

    response = client.patch(f"/gallery/{image_id}", json={"caption": "Choir at Easter"}, headers=viewer_headers)

    assert response.status_code == 403


def test_update_unknown_gallery_image_returns_404(client, editor_headers):
    response = client.patch("/gallery/9999", json={"caption": "Choir at Easter"}, headers=editor_headers)

    assert response.status_code == 404


# --- deleting ---

def test_delete_gallery_image_returns_204_and_then_it_is_gone(client, editor_headers):
    image_id = create_gallery_image(client, editor_headers).json()["id"]

    response = client.delete(f"/gallery/{image_id}", headers=editor_headers)

    assert response.status_code == 204
    # gallery has no "get one" route, so we check the list instead
    assert client.get("/gallery").json() == []


def test_delete_gallery_image_twice_returns_404(client, editor_headers):
    image_id = create_gallery_image(client, editor_headers).json()["id"]
    client.delete(f"/gallery/{image_id}", headers=editor_headers)

    response = client.delete(f"/gallery/{image_id}", headers=editor_headers)

    assert response.status_code == 404


def test_delete_gallery_image_as_viewer_returns_403(client, editor_headers, viewer_headers):
    image_id = create_gallery_image(client, editor_headers).json()["id"]

    response = client.delete(f"/gallery/{image_id}", headers=viewer_headers)

    assert response.status_code == 403
    assert len(client.get("/gallery").json()) == 1


def test_delete_unknown_gallery_image_returns_404(client, editor_headers):
    response = client.delete("/gallery/9999", headers=editor_headers)

    assert response.status_code == 404
