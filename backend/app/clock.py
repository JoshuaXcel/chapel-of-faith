from datetime import date, datetime
from zoneinfo import ZoneInfo

from app.config import settings

# One place for "what time is it at the church?".
# datetime.now() and date.today() use the server's own clock, which is often UTC on
# a cloud server. Lagos is UTC+1, so between midnight and 1 am the server would still
# think it was yesterday. These helpers always answer in the church's time zone.

CHURCH_TZ = ZoneInfo(settings.church_timezone)

# event times are saved without a time zone (as church time), so we compare
# them with church time without a time zone too
def church_now() -> datetime:
    return datetime.now(CHURCH_TZ).replace(tzinfo=None)

def church_today() -> date:
    return datetime.now(CHURCH_TZ).date()

# a time sent with a zone (e.g. "...Z" or "+00:00") is turned into church time,
# so every saved time means the same thing
def to_church_time(value: datetime | None) -> datetime | None:
    if value is None or value.tzinfo is None:
        return value
    return value.astimezone(CHURCH_TZ).replace(tzinfo=None)
