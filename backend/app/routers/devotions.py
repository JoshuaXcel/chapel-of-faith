from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db
from app.models.devotion import Devotion
from app.schemas import DevotionOut

router = APIRouter(prefix="/devotions", tags=["devotions"])
@router.get("/today", response_model=DevotionOut)
def get_devotion_today(db: Session = Depends(get_db)):
    """Get today's devotion."""
    stmt = select(devotion.Devotion).where(devotion.Devotion.devotion_date == date.today())
    result = db.scalar(stmt)
    if not result:
        raise HTTPException(status_code=404, detail="No devotion for today")
    return result

@router.get("", response_model=list[DevotionOut])
def get_all_devotions(db: Session = Depends(get_db)):
    """Get all devotions, newest first."""
    stmt = select(devotion.Devotion).order_by(devotion.Devotion.devotion_date.desc())
    result = db.scalars(stmt).all()
    return result

@router.get("/{devotion_id}", response_model=DevotionOut)
def get_devotion_by_id(devotion_id: int, db: Session = Depends(get_db)):
    """Get a devotion by ID."""
    stmt = select(devotion.Devotion).where(devotion.Devotion.id == devotion_id)
    result = db.scalar(stmt)
    if not result:
        raise HTTPException(status_code=404, detail="Devotion not found")
    return result

