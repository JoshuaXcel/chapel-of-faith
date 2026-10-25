from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.gallery import GalleryImage
from app.schemas import GalleryImageOut, GalleryImageCreate, GalleryImageUpdate
from app.dependencies import require_role

router = APIRouter(prefix="/gallery", tags=["gallery"])

@router.get("", response_model=list[GalleryImageOut])
def get_gallery_images(db: Session = Depends(get_db)):
    """Get all gallery images, newest first (created_at desc)"""
    stmt = select(GalleryImage).order_by(GalleryImage.created_at.desc())
    images = db.execute(stmt).scalars().all()
    return images

@router.post("", response_model=GalleryImageOut, status_code=status.HTTP_201_CREATED)
def create_gallery_image(payload: GalleryImageCreate, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    gallery_image = GalleryImage(**payload.model_dump())
    db.add(gallery_image)
    db.commit()
    db.refresh(gallery_image)  # pull back the id + created_at the DB made
    return gallery_image

@router.patch("/{gallery_image_id}", response_model=GalleryImageOut)
def update_gallery_image(gallery_image_id: int, payload: GalleryImageUpdate, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    gallery_image = db.get(GalleryImage, gallery_image_id)
    if not gallery_image:
        raise HTTPException(status_code=404, detail="Gallery image not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(gallery_image, key, value)
    db.commit()
    db.refresh(gallery_image)
    return gallery_image

@router.delete("/{gallery_image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gallery_image(gallery_image_id: int, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    gallery_image = db.get(GalleryImage, gallery_image_id)
    if not gallery_image:
        raise HTTPException(status_code=404, detail="Gallery image not found")
    db.delete(gallery_image)
    db.commit()