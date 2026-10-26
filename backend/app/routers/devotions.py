from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.clock import church_today
from app.database import get_db
from app.models.devotion import Devotion
from app.schemas import DevotionOut, DevotionCreate, DevotionUpdate
from app.dependencies import require_role

router = APIRouter(prefix="/devotions", tags=["devotions"])


@router.get("/today", response_model=DevotionOut)
def get_devotion_today(db: Session = Depends(get_db)):
    """Get today's devotion."""
    # "today" in the church's time zone, not the server's (see app/clock.py)
    stmt = select(Devotion).where(Devotion.devotion_date == church_today())
    result = db.scalar(stmt)
    if not result:
        raise HTTPException(status_code=404, detail="No devotion for today")
    return result

@router.get("", response_model=list[DevotionOut])
def get_all_devotions(db: Session = Depends(get_db)):
    """Get all devotions, newest first."""
    stmt = select(Devotion).order_by(Devotion.devotion_date.desc())
    result = db.scalars(stmt).all()
    return result

@router.get("/{devotion_id}", response_model=DevotionOut)
def get_devotion_by_id(devotion_id: int, db: Session = Depends(get_db)):
    """Get a devotion by ID."""
    stmt = select(Devotion).where(Devotion.id == devotion_id)
    result = db.scalar(stmt)
    if not result:
        raise HTTPException(status_code=404, detail="Devotion not found")
    return result

@router.post("", response_model=DevotionOut, status_code=status.HTTP_201_CREATED)
def create_devotion(payload: DevotionCreate, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    devotion = Devotion(**payload.model_dump())
    db.add(devotion)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="A devotion for that date already exists")
    db.refresh(devotion)  # pull back the id + created_at the DB made
    return devotion

@router.patch("/{devotion_id}", response_model=DevotionOut)
def update_devotion(devotion_id: int, payload: DevotionUpdate, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    devotion = db.get(Devotion, devotion_id)
    if not devotion:
        raise HTTPException(status_code=404, detail="Devotion not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(devotion, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="A devotion for that date already exists")
    db.refresh(devotion)
    return devotion

@router.delete("/{devotion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_devotion(devotion_id: int, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    devotion = db.get(Devotion, devotion_id)
    if not devotion:
        raise HTTPException(status_code=404, detail="Devotion not found")
    db.delete(devotion)
    db.commit()

