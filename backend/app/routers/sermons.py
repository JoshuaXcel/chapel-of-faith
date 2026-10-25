from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Sermon
from app.schemas import SermonOut

router = APIRouter(prefix="/sermons", tags=["sermons"])

@router.get("", response_model=list[SermonOut])
def list_sermons(db: Session = Depends(get_db)):
    sermons = db.scalars(select(Sermon).order_by(Sermon.preached_on.desc())).all()
    return sermons

@router.get("/{sermon_id}", response_model=SermonOut)
def get_sermon(sermon_id: int, db: Session = Depends(get_db)):
    sermon = db.get(Sermon, sermon_id)
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    return sermon

@router.post("", response_model=SermonOut, status_code=status.HTTP_201_CREATED)
def create_sermon(payload: SermonCreate, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    sermon = Sermon(**payload.model_dump())
    db.add(sermon)
    db.commit()
    db.refresh(sermon)  # pull back the id + created_at the DB made
    return sermon

@router.patch("/{sermon_id}", response_model=SermonOut)
def update_sermon(sermon_id: int, payload: SermonUpdate, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    sermon = db.get(Sermon, sermon_id)
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(sermon, key, value)
    db.commit()
    db.refresh(sermon)
    return sermon

@router.delete("/{sermon_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sermon(sermon_id: int, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    sermon = db.get(Sermon, sermon_id)
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    db.delete(sermon)
    db.commit()