from datetime import date, datetime, timedelta

from app.models import Devotion, Event, GalleryImage, Leadership, Sermon


# --- empty lists ---

def test_events_list_is_empty_at_first(client):
    response = client.get("/events")

    assert response.status_code == 200
    assert response.json() == []


def test_sermons_list_is_empty_at_first(client):
    response = client.get("/sermons")

    assert response.status_code == 200
    assert response.json() == []


def test_devotions_list_is_empty_at_first(client):
    response = client.get("/devotions")

    assert response.status_code == 200
    assert response.json() == []


def test_leadership_list_is_empty_at_first(client):
    response = client.get("/leadership")

    assert response.status_code == 200
    assert response.json() == []


def test_gallery_list_is_empty_at_first(client):
    response = client.get("/gallery")

    assert response.status_code == 200
    assert response.json() == []


# --- lists with data ---

def test_events_list_shows_only_upcoming_events_soonest_first(client, db_session):
    now = datetime.now()
    db_session.add_all([
        Event(title="Old event", location="Hall", starts_at=now - timedelta(days=3)),
        Event(title="Later event", location="Hall", starts_at=now + timedelta(days=20)),
        Event(title="Soon event", location="Hall", starts_at=now + timedelta(days=2)),
    ])
    db_session.commit()

    response = client.get("/events")

    titles = [event["title"] for event in response.json()]
    assert titles == ["Soon event", "Later event"]


def test_sermons_list_shows_newest_first(client, db_session):
    db_session.add_all([
        Sermon(title="Older sermon", preacher="Pastor A", preached_on=date(2026, 1, 4)),
        Sermon(title="Newer sermon", preacher="Pastor B", preached_on=date(2026, 3, 1)),
    ])
    db_session.commit()

    response = client.get("/sermons")

    titles = [sermon["title"] for sermon in response.json()]
    assert titles == ["Newer sermon", "Older sermon"]


def test_devotions_list_shows_newest_first(client, db_session):
    db_session.add_all([
        Devotion(title="First", scripture="John 3:16", body="Text", devotion_date=date(2026, 5, 1)),
        Devotion(title="Second", scripture="Psalm 23", body="Text", devotion_date=date(2026, 5, 2)),
    ])
    db_session.commit()

    response = client.get("/devotions")

    titles = [devotion["title"] for devotion in response.json()]
    assert titles == ["Second", "First"]


def test_leadership_list_is_sorted_by_display_order(client, db_session):
    db_session.add_all([
        Leadership(name="Deacon Paul", role="Deacon", display_order=2),
        Leadership(name="Pastor Ruth", role="Senior Pastor", display_order=1),
    ])
    db_session.commit()

    response = client.get("/leadership")

    names = [member["name"] for member in response.json()]
    assert names == ["Pastor Ruth", "Deacon Paul"]


def test_gallery_list_shows_images(client, db_session):
    db_session.add(GalleryImage(image_url="/media/choir.jpg", caption="Choir"))
    db_session.commit()

    response = client.get("/gallery")

    assert response.status_code == 200
    assert response.json()[0]["image_url"] == "/media/choir.jpg"
    assert response.json()[0]["caption"] == "Choir"


# --- get one by id ---

def test_get_event_by_id(client, db_session):
    event = Event(title="Youth night", location="Hall", starts_at=datetime.now() + timedelta(days=5))
    db_session.add(event)
    db_session.commit()

    response = client.get(f"/events/{event.id}")

    assert response.status_code == 200
    assert response.json()["title"] == "Youth night"


def test_get_sermon_by_id(client, db_session):
    sermon = Sermon(title="Faith", preacher="Pastor A", preached_on=date(2026, 2, 1))
    db_session.add(sermon)
    db_session.commit()

    response = client.get(f"/sermons/{sermon.id}")

    assert response.status_code == 200
    assert response.json()["title"] == "Faith"


def test_get_devotion_by_id(client, db_session):
    devotion = Devotion(title="Hope", scripture="Romans 15:13", body="Text", devotion_date=date(2026, 6, 1))
    db_session.add(devotion)
    db_session.commit()

    response = client.get(f"/devotions/{devotion.id}")

    assert response.status_code == 200
    assert response.json()["title"] == "Hope"


def test_get_leadership_member_by_id(client, db_session):
    member = Leadership(name="Pastor Ruth", role="Senior Pastor")
    db_session.add(member)
    db_session.commit()

    response = client.get(f"/leadership/{member.id}")

    assert response.status_code == 200
    assert response.json()["name"] == "Pastor Ruth"


def test_unknown_event_id_returns_404(client):
    response = client.get("/events/9999")

    assert response.status_code == 404


def test_unknown_sermon_id_returns_404(client):
    response = client.get("/sermons/9999")

    assert response.status_code == 404


def test_unknown_devotion_id_returns_404(client):
    response = client.get("/devotions/9999")

    assert response.status_code == 404


def test_unknown_leadership_id_returns_404(client):
    response = client.get("/leadership/9999")

    assert response.status_code == 404


def test_id_that_is_not_a_number_returns_422(client):
    response = client.get("/events/abc")

    assert response.status_code == 422


# --- today's devotion ---

def test_devotion_today_returns_todays_devotion(client, db_session):
    db_session.add(Devotion(title="Today", scripture="Psalm 118:24", body="Text", devotion_date=date.today()))
    db_session.add(Devotion(title="Yesterday", scripture="Psalm 1", body="Text", devotion_date=date.today() - timedelta(days=1)))
    db_session.commit()

    response = client.get("/devotions/today")

    assert response.status_code == 200
    assert response.json()["title"] == "Today"


def test_devotion_today_returns_404_when_there_is_none(client):
    response = client.get("/devotions/today")

    assert response.status_code == 404
    assert response.json()["detail"] == "No devotion for today"
