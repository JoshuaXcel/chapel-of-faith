from app.main import MAX_UPLOAD_REQUEST_BYTES
from app.routers import images

# the server looks at the first bytes of the file ("magic bytes"), not at the type the
# browser sends, so each fake image starts with its format's real signature
PNG_BYTES = b"\x89PNG\r\n\x1a\n fake png data"
JPEG_BYTES = b"\xff\xd8\xff\xe0 fake jpeg data"
WEBP_BYTES = b"RIFF\x10\x00\x00\x00WEBPVP8 fake webp data"
GIF_BYTES = b"GIF89a fake gif data"


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
    response = upload(client, editor_headers, filename="photo.jpeg", data=JPEG_BYTES, content_type="image/jpeg")

    assert response.status_code == 201
    assert response.json()["url"].endswith(".jpg")


def test_upload_webp_is_allowed(client, media_dir, editor_headers):
    response = upload(client, editor_headers, filename="photo.webp", data=WEBP_BYTES, content_type="image/webp")

    assert response.status_code == 201
    assert response.json()["url"].endswith(".webp")


def test_upload_gif_is_allowed(client, media_dir, editor_headers):
    response = upload(client, editor_headers, filename="photo.gif", data=GIF_BYTES, content_type="image/gif")

    assert response.status_code == 201
    assert response.json()["url"].endswith(".gif")


def test_file_ending_comes_from_the_file_not_from_the_upload(client, media_dir, editor_headers):
    # a real PNG sent with a .jpg name and a jpeg type is still saved as .png
    response = upload(client, editor_headers, filename="photo.jpg", data=PNG_BYTES, content_type="image/jpeg")

    assert response.status_code == 201
    assert response.json()["url"].endswith(".png")


def test_html_pretending_to_be_an_image_returns_400(client, media_dir, editor_headers):
    # the browser type says png, but the file is really a web page with a script in it
    page = b"<html><script>alert(1)</script></html>"

    response = upload(client, editor_headers, filename="photo.png", data=page, content_type="image/png")

    assert response.status_code == 400
    assert list(media_dir.iterdir()) == []


def test_svg_returns_400(client, media_dir, editor_headers):
    # SVG files can carry scripts, so they are not accepted
    svg = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'

    response = upload(client, editor_headers, filename="logo.svg", data=svg, content_type="image/svg+xml")

    assert response.status_code == 400


def test_uploaded_file_is_saved_in_media_folder(client, media_dir, editor_headers):
    url = upload(client, editor_headers).json()["url"]

    saved_name = url.removeprefix("/media/")
    assert (media_dir / saved_name).read_bytes() == PNG_BYTES


def test_media_folder_is_an_absolute_path(media_dir):
    assert images.MEDIA_DIR.is_absolute()
    assert images.MEDIA_DIR == media_dir


def test_uploaded_image_can_be_opened_at_its_url(client, media_dir, editor_headers):
    url = upload(client, editor_headers).json()["url"]

    response = client.get(url)

    assert response.status_code == 200
    assert response.content == PNG_BYTES
    assert response.headers["x-content-type-options"] == "nosniff"


def test_media_url_cannot_reach_files_outside_the_media_folder(client, media_dir):
    # a file right next to the media folder, asked for with an encoded "../"
    outside = media_dir.parent / f"{media_dir.name}-secret.txt"
    outside.write_text("secret")
    try:
        response = client.get(f"/media/%2e%2e/{outside.name}")

        assert response.status_code == 404
        assert "secret" not in response.text
    finally:
        outside.unlink()


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
    assert response.json()["detail"] == "Only JPEG, PNG, WebP or GIF images are allowed"
    assert list(media_dir.iterdir()) == []


def test_upload_bigger_than_5_mb_returns_413(client, media_dir, editor_headers):
    too_big = PNG_BYTES + b"0" * (images.MAX_BYTES + 1 - len(PNG_BYTES))

    response = upload(client, editor_headers, data=too_big)

    assert response.status_code == 413
    assert response.json()["detail"] == "Image must be 5 MB or smaller"
    assert list(media_dir.iterdir()) == []


def test_huge_request_is_refused_before_it_is_read(client, media_dir, editor_headers):
    # the size header alone is enough to refuse it
    headers = {**editor_headers, "Content-Length": str(MAX_UPLOAD_REQUEST_BYTES + 1)}

    response = client.post("/images", content=b"x", headers=headers)

    assert response.status_code == 413
    assert list(media_dir.iterdir()) == []


def test_upload_of_exactly_5_mb_is_allowed(client, media_dir, editor_headers):
    just_right = PNG_BYTES + b"0" * (images.MAX_BYTES - len(PNG_BYTES))

    response = upload(client, editor_headers, data=just_right)

    assert response.status_code == 201


def test_upload_without_a_file_returns_422(client, media_dir, editor_headers):
    response = client.post("/images", headers=editor_headers)

    assert response.status_code == 422
