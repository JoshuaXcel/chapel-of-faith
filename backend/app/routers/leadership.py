from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.leadership import Leadership
from app.schemas import LeadershipOut

router = APIRouter(prefix="/leadership", tags=["Leadership"])

@router.get("", response_model=list[LeadershipOut])
def get_leadership(db: Session = Depends(get_db)):
    stmt = select(Leadership).order_by(Leadership.display_order, Leadership.name)
    leadership_list = db.execute(stmt).scalars().all()
    return leadership_list

@router.get("/{member_id}", response_model=LeadershipOut)
def get_leadership_member(member_id: int, db: Session = Depends(get_db)):
    stmt = select(Leadership).where(Leadership.id == member_id)
    leadership_member = db.execute(stmt).scalar_one_or_none()
    if leadership_member is None:
        raise HTTPException(status_code=404, detail="Leadership member not found")
    return leadership_member

