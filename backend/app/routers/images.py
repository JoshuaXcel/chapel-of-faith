from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from app.dependencies import require_role

router = APIRouter(prefix="/images", tags=["images"])

MEDIA_DIR = Path("media")

allowed_types = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
}

MAX_BYTES = 5 * 1024 * 1024  # 5 MB

def save_image(data: bytes, ext: str) -> str:
    name = uuid4().hex + ext
    (MEDIA_DIR / name).write_bytes(data)
    return f"/media/{name}"

@router.post("", status_code=201)
def upload_image(file: UploadFile = File(...), admin = Depends(require_role("super_admin", "editor"))):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG or WebP images are allowed")

    data = file.file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Image must be 5 MB or smaller")

    url = save_image(data, ALLOWED_TYPES[file.content_type])
    return {"url": url}