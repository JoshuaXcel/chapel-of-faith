from uuid import uuid4
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from app.config import settings
from app.dependencies import require_role

router = APIRouter(prefix="/images", tags=["images"])

# an absolute path from settings (default backend/media), so it doesn't depend on
# the folder uvicorn was started from
MEDIA_DIR = settings.media_dir

MAX_BYTES = 5 * 1024 * 1024  # 5 MB

# The browser's content type and the file name are both chosen by whoever uploads,
# so neither can be trusted. Instead we look at the first bytes of the file itself
# ("magic bytes"): every real image format starts with its own fixed signature.
# The file ending we save with comes from that signature, never from the upload.
def detect_image_type(data: bytes) -> str | None:
    if data.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    if data.startswith((b"GIF87a", b"GIF89a")):
        return ".gif"
    return None

def save_image(data: bytes, ext: str) -> str:
    # a random name made by the server: the uploader's file name is never used,
    # so names like "../../main.py" can't write outside the media folder
    name = uuid4().hex + ext
    (MEDIA_DIR / name).write_bytes(data)
    return f"/media/{name}"

@router.post("", status_code=201)
def upload_image(file: UploadFile = File(...), admin = Depends(require_role("super_admin", "editor"))):
    # read at most 1 byte more than the limit, so a huge file is never loaded into memory
    data = file.file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Image must be 5 MB or smaller")

    ext = detect_image_type(data)
    if ext is None:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP or GIF images are allowed")

    url = save_image(data, ext)
    return {"url": url}
