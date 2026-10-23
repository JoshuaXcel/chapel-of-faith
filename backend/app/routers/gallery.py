from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.gallery import GalleryImage
from app.schemas import GalleryImageOut

router = APIRouter(prefix="/gallery", tags=["gallery"])

@router.get("", response_model=list[GalleryImageOut])
def get_gallery_images(db: Session = Depends(get_db)):
    """Get all gallery images, newest first (created_at desc)"""
    stmt = select(GalleryImage).order_by(GalleryImage.created_at.desc())
    images = db.execute(stmt).scalars().all()
    return images