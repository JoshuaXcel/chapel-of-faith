from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.member import Member
from app.schemas import MemberCreate, MemberOut
from app.dependencies import require_role

router = APIRouter(prefix="/members", tags=["members"])

# public: anyone can register from the membership form (no login needed)
@router.post("", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
def register_member(payload: MemberCreate, db: Session = Depends(get_db)):
    member = Member(**payload.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)  # pull back the id + created_at the DB made
    return member

# admin only: members' phone numbers are private, so the list needs a login
@router.get("", response_model=list[MemberOut])
def list_members(db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    members = db.scalars(select(Member).order_by(Member.created_at.desc(), Member.id.desc())).all()
    return members

@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(member_id: int, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
