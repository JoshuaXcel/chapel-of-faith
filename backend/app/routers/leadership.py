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
    leadership_member = db.get(Leadership, member_id)
    if leadership_member is None:
        raise HTTPException(status_code=404, detail="Leadership member not found")
    return leadership_member

@router.post("", response_model=LeadershipOut, status_code=status.HTTP_201_CREATED)
def create_leadership_member(payload: LeadershipCreate, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    leadership_member = Leadership(**payload.model_dump())
    db.add(leadership_member)
    db.commit()
    db.refresh(leadership_member)  # pull back the id + created_at the DB made
    return leadership_member

@router.patch("/{leadership_id}", response_model=LeadershipOut)
def update_leadership_member(leadership_id: int, payload: LeadershipUpdate, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    leadership_member = db.get(Leadership, leadership_id)
    if not leadership_member:
        raise HTTPException(status_code=404, detail="Leadership member not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(leadership_member, key, value)
    db.commit()
    db.refresh(leadership_member)
    return leadership_member

@router.delete("/{leadership_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_leadership_member(leadership_id: int, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    leadership_member = db.get(Leadership, leadership_id)
    if not leadership_member:
        raise HTTPException(status_code=404, detail="Leadership member not found")
    db.delete(leadership_member)
    db.commit()