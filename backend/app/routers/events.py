# events.py: the routes for church events (list, one event, and admin create/edit/delete).
# FastAPI idea: a router is a group of URL paths, like a Flask Blueprint.
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.clock import church_now
from app.database import get_db
from app.models.event import Event
from app.schemas import EventOut, EventCreate, EventUpdate
from app.dependencies import require_role

router = APIRouter(prefix="/events", tags=["events"])

@router.get("", response_model=list[EventOut])
def list_events(db: Session = Depends(get_db)):
    # church time, not the server's clock (see app/clock.py)
    now = church_now()
    # an event is still on the list while it is running: it has started, but has not ended yet
    # (ends_at is empty for many events, and an empty end time never matches, which is fine)
    stmt = select(Event).where(or_(Event.starts_at >= now, Event.ends_at >= now)).order_by(Event.starts_at)
    events = db.scalars(stmt).all()
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
    # only one of the two times may have been sent, so compare after merging with the saved event
    if event.ends_at is not None and event.ends_at < event.starts_at:
        db.rollback()  # undo the changes we just made on the object
        raise HTTPException(status_code=422, detail="ends_at cannot be before starts_at")
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
