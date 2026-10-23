from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import Event
from app.schemas import EventOut

router = APIRouter(prefix="/events", tags=["events"])

@router.get("", response_model=list[EventOut])
def list_events(db: Session = Depends(get_db)):
    events = db.scalars(select(Event).where(Event.starts_at >= datetime.now()).order_by(Event.starts_at)).all()
    return events

@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event