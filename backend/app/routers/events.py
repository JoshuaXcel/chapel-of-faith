from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import Event
from app.schemas import EventOut, EventCreate, EventUpdate
from app.dependencies import require_role

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

@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    event = Event(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)  # pull back the id + created_at the DB made
    return event

@router.patch("/{event_id}", response_model=EventOut)
def update_event(event_id: int, payload: EventUpdate, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: Session = Depends(get_db), admin = Depends(require_role("super_admin", "editor"))):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
