from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo

from app import clock
from app.models import Devotion


def test_church_today_uses_lagos_time():
    assert clock.church_today() == datetime.now(ZoneInfo("Africa/Lagos")).date()


def test_church_now_has_no_time_zone_like_the_saved_event_times():
    now = clock.church_now()

    assert now.tzinfo is None
    lagos = datetime.now(ZoneInfo("Africa/Lagos")).replace(tzinfo=None)
    assert abs(lagos - now) < timedelta(seconds=5)


def test_utc_time_just_before_midnight_is_already_tomorrow_in_lagos():
    late_utc = datetime(2026, 1, 1, 23, 30, tzinfo=timezone.utc)

    assert clock.to_church_time(late_utc) == datetime(2026, 1, 2, 0, 30)


def test_time_without_a_zone_is_kept_as_it_is():
    plain = datetime(2026, 1, 1, 9, 0)

    assert clock.to_church_time(plain) == plain


def test_today_devotion_follows_church_time(client, db_session, monkeypatch):
    # pretend it's 00:30 on 2 January in Lagos (still 1 January in UTC)
    monkeypatch.setattr("app.routers.devotions.church_today", lambda: datetime(2026, 1, 2).date())
    db_session.add(Devotion(title="New Year", scripture="Psalm 1", body="Text", devotion_date=datetime(2026, 1, 2).date()))
    db_session.commit()

    response = client.get("/devotions/today")

    assert response.status_code == 200
    assert response.json()["title"] == "New Year"
