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
