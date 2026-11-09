# Tests for GET /events: an event that has started but has not finished yet should still
# be on the list, because the church's own page shows its end time too.
# (FastAPI test client -> the same routes the website calls.)
from datetime import timedelta

from app.clock import church_now
from app.models import Event


def test_event_that_has_started_but_not_ended_is_still_listed(client, db_session):
    now = church_now()
    db_session.add(
        Event(title="Morning service", location="Hall", starts_at=now - timedelta(hours=1), ends_at=now + timedelta(hours=2))
    )
    db_session.commit()

    titles = [event["title"] for event in client.get("/events").json()]

    assert titles == ["Morning service"]


def test_event_that_has_already_ended_is_not_listed(client, db_session):
    now = church_now()
    db_session.add(
        Event(title="Finished service", location="Hall", starts_at=now - timedelta(hours=3), ends_at=now - timedelta(hours=1))
    )
    db_session.commit()

    assert client.get("/events").json() == []
