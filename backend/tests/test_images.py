from app.routers import images

# the server only checks the type the browser sends, so a few bytes are enough here
PNG_BYTES = b"\x89PNG\r\n\x1a\n fake png data"


def upload(client, headers, filename="photo.png", data=PNG_BYTES, content_type="image/png"):
    return client.post("/images", files={"file": (filename, data, content_type)}, headers=headers)


def test_upload_without_token_returns_401(client, media_dir):
    response = upload(client, headers={})

    assert response.status_code == 401


def test_upload_as_viewer_returns_403(client, media_dir, viewer_headers):
    response = upload(client, viewer_headers)

    assert response.status_code == 403
    assert list(media_dir.iterdir()) == []


def test_upload_png_returns_201_and_a_media_url(client, media_dir, editor_headers):
    response = upload(client, editor_headers)

    assert response.status_code == 201
    url = response.json()["url"]
    assert url.startswith("/media/")
    assert url.endswith(".png")


def test_super_admin_can_upload(client, media_dir, super_admin_headers):
    response = upload(client, super_admin_headers)

    assert response.status_code == 201


def test_upload_jpeg_gets_jpg_ending(client, media_dir, editor_headers):
    response = upload(client, editor_headers, filename="photo.jpeg", content_type="image/jpeg")

    assert response.status_code == 201
    assert response.json()["url"].endswith(".jpg")


def test_upload_webp_is_allowed(client, media_dir, editor_headers):
    response = upload(client, editor_headers, filename="photo.webp", content_type="image/webp")

    assert response.status_code == 201
    assert response.json()["url"].endswith(".webp")


def test_uploaded_file_is_saved_in_media_folder(client, media_dir, editor_headers):
    url = upload(client, editor_headers).json()["url"]

    saved_name = url.removeprefix("/media/")
    assert (media_dir / saved_name).read_bytes() == PNG_BYTES


def test_uploaded_image_can_be_opened_at_its_url(client, media_dir, editor_headers):
    url = upload(client, editor_headers).json()["url"]

    response = client.get(url)

    assert response.status_code == 200
    assert response.content == PNG_BYTES


def test_uploaded_filename_is_never_used(client, media_dir, editor_headers):
    response = upload(client, editor_headers, filename="../../evil.png")

    assert response.status_code == 201
    assert "evil" not in response.json()["url"]
    # exactly one file, saved inside the media folder, with our own random name
    saved_files = list(media_dir.iterdir())
    assert len(saved_files) == 1
    assert "evil" not in saved_files[0].name
    assert not (media_dir.parent.parent / "evil.png").exists()


def test_two_uploads_get_different_names(client, media_dir, editor_headers):
    first = upload(client, editor_headers).json()["url"]
    second = upload(client, editor_headers).json()["url"]

    assert first != second


def test_upload_pdf_returns_400(client, media_dir, editor_headers):
    response = upload(client, editor_headers, filename="notes.pdf", data=b"%PDF-1.4", content_type="application/pdf")

    assert response.status_code == 400
    assert response.json()["detail"] == "Only JPEG, PNG or WebP images are allowed"
    assert list(media_dir.iterdir()) == []


def test_upload_bigger_than_5_mb_returns_413(client, media_dir, editor_headers):
    too_big = b"0" * (images.MAX_BYTES + 1)

    response = upload(client, editor_headers, data=too_big)

    assert response.status_code == 413
    assert response.json()["detail"] == "Image must be 5 MB or smaller"
    assert list(media_dir.iterdir()) == []


def test_upload_of_exactly_5_mb_is_allowed(client, media_dir, editor_headers):
    just_right = b"0" * images.MAX_BYTES

    response = upload(client, editor_headers, data=just_right)

    assert response.status_code == 201


def test_upload_without_a_file_returns_422(client, media_dir, editor_headers):
    response = client.post("/images", headers=editor_headers)

    assert response.status_code == 422
