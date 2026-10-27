from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator
from datetime import date, datetime
from typing import Annotated, Literal
import calendar

from app.clock import church_today, to_church_time

# Size limits for text sent to the API.
# Short fields match their column size in models/, so text that is too long gets a
# clear 422 instead of a database error (500). Long texts (Text columns) have no limit
# in the database, so we pick 10,000 characters: plenty for a devotion or a bio, and
# nobody can post megabytes of text.
NAME_MAX = 120
LONG_TEXT_MAX = 10_000
URL_MAX = 500

# links saved in the database end up in <img src> / <audio src> on the website,
# so only normal web addresses and our own uploaded files are accepted
# (this blocks things like "javascript:..." links)
def check_link(value: str) -> str:
    if not value.startswith(("https://", "http://", "/media/")):
        raise ValueError("must be a web address (https://...) or an uploaded file (/media/...)")
    return value

Link = Annotated[str, Field(max_length=URL_MAX), AfterValidator(check_link)]

class LoginRequest(BaseModel):
    # a plain string (not EmailStr) so a typo gets the same "Incorrect email or password"
    email: str = Field(max_length=255)
    # bcrypt only uses 72 bytes, 128 characters is more than enough for any real password
    password: str = Field(max_length=128)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class AdminOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    model_config = ConfigDict(from_attributes=True)

class SermonOut(BaseModel):
    id: int
    title: str
    description: str | None
    preacher: str
    preached_on: date
    scripture: str | None
    audio_url: str | None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DevotionOut(BaseModel):
    id: int
    title: str
    scripture: str
    body: str
    author: str | None
    devotion_date: date
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class LeadershipOut(BaseModel):
    id: int
    name: str
    role: str
    bio: str | None
    photo_url: str | None
    display_order: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class GalleryImageOut(BaseModel):
    id: int
    image_url: str
    caption: str | None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
    
class EventOut(BaseModel):
    id: int
    title: str
    description: str | None
    location: str
    starts_at: datetime
    ends_at: datetime | None
    image_url: str | None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=LONG_TEXT_MAX)
    location: str = Field(min_length=1, max_length=200)
    starts_at: datetime
    ends_at: datetime | None = None
    image_url: Link | None = None

    # times are saved as church time without a zone (see app/clock.py)
    @field_validator("starts_at", "ends_at")
    @classmethod
    def use_church_time(cls, value):
        return to_church_time(value)

    # an event can't finish before it starts
    @model_validator(mode="after")
    def check_end_after_start(self):
        if self.ends_at is not None and self.ends_at < self.starts_at:
            raise ValueError("ends_at cannot be before starts_at")
        return self

class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=LONG_TEXT_MAX)
    location: str | None = Field(default=None, min_length=1, max_length=200)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    image_url: Link | None = None

    @field_validator("starts_at", "ends_at")
    @classmethod
    def use_church_time(cls, value):
        return to_church_time(value)

    # if both times are sent, check them here (if only one is sent, the router
    # compares it with the saved event)
    @model_validator(mode="after")
    def check_end_after_start(self):
        if self.ends_at is not None and self.starts_at is not None and self.ends_at < self.starts_at:
            raise ValueError("ends_at cannot be before starts_at")
        return self

    # these fields can't be empty in the database, so null gives 422 instead of a 500
    @field_validator("title", "location", "starts_at")
    @classmethod
    def reject_null(cls, value):
        if value is None:
            raise ValueError("cannot be null")
        return value

class SermonCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=LONG_TEXT_MAX)
    preacher: str = Field(min_length=1, max_length=NAME_MAX)
    preached_on: date
    scripture: str | None = Field(default=None, max_length=120)
    audio_url: Link | None = None

class SermonUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=LONG_TEXT_MAX)
    preacher: str | None = Field(default=None, min_length=1, max_length=NAME_MAX)
    preached_on: date | None = None
    scripture: str | None = Field(default=None, max_length=120)
    audio_url: Link | None = None

    # these fields can't be empty in the database, so null gives 422 instead of a 500
    @field_validator("title", "preacher", "preached_on")
    @classmethod
    def reject_null(cls, value):
        if value is None:
            raise ValueError("cannot be null")
        return value

class DevotionCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    scripture: str = Field(min_length=1, max_length=120)
    body: str = Field(min_length=1, max_length=LONG_TEXT_MAX)
    devotion_date: date
    author: str | None = Field(default=None, max_length=NAME_MAX)

class DevotionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    scripture: str | None = Field(default=None, min_length=1, max_length=120)
    body: str | None = Field(default=None, min_length=1, max_length=LONG_TEXT_MAX)
    devotion_date: date | None = None
    author: str | None = Field(default=None, max_length=NAME_MAX)

    # these fields can't be empty in the database, so null gives 422 instead of a 500
    @field_validator("title", "scripture", "body", "devotion_date")
    @classmethod
    def reject_null(cls, value):
        if value is None:
            raise ValueError("cannot be null")
        return value

class LeadershipCreate(BaseModel):
    name: str = Field(min_length=1, max_length=NAME_MAX)
    role: str = Field(min_length=1, max_length=NAME_MAX)
    bio: str | None = Field(default=None, max_length=LONG_TEXT_MAX)
    photo_url: Link | None = None
    display_order: int = 0

class LeadershipUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=NAME_MAX)
    role: str | None = Field(default=None, min_length=1, max_length=NAME_MAX)
    bio: str | None = Field(default=None, max_length=LONG_TEXT_MAX)
    photo_url: Link | None = None
    display_order: int | None = None

    # these fields can't be empty in the database, so null gives 422 instead of a 500
    @field_validator("name", "role", "display_order")
    @classmethod
    def reject_null(cls, value):
        if value is None:
            raise ValueError("cannot be null")
        return value

class GalleryImageCreate(BaseModel):
    image_url: Link
    caption: str | None = Field(default=None, max_length=255)

class GalleryImageUpdate(BaseModel):
    image_url: Link | None = None
    caption: str | None = Field(default=None, max_length=255)

    # these fields can't be empty in the database, so null gives 422 instead of a 500
    @field_validator("image_url")
    @classmethod
    def reject_null(cls, value):
        if value is None:
            raise ValueError("cannot be null")
        return value

MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
               "July", "August", "September", "October", "November", "December"]

# the choices on the membership form ("I am a...")
MemberType = Literal["undergraduate", "graduate", "staff", "other"]
Level = Literal["100L", "200L", "300L", "400L", "500L"]

# membership form: full_name, phone, member_type and the birthday's day + month are required, the rest is optional.
# max_length matches the column sizes in models/member.py, so long text gives 422 instead of a 500
class MemberCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=1, max_length=30)
    # EmailStr checks it really looks like an email address
    email: EmailStr | None = None
    gender: str | None = Field(default=None, max_length=20)
    member_type: MemberType
    department: str | None = Field(default=None, max_length=120)
    level: Level | None = None
    hostel_or_address: str | None = Field(default=None, max_length=255)
    birth_day: int = Field(ge=1, le=31)
    birth_month: int = Field(ge=1, le=12)
    birth_year: int | None = None
    joined_whatsapp_consent: bool = False

    # "   " is not a name or a phone number
    @field_validator("full_name", "phone")
    @classmethod
    def reject_blank(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("cannot be blank")
        return value

    # the year is optional, but if it's given it must be a sensible one
    @field_validator("birth_year")
    @classmethod
    def check_birth_year(cls, value):
        this_year = church_today().year
        if value is not None and not 1900 <= value <= this_year:
            raise ValueError(f"must be between 1900 and {this_year}")
        return value

    # day and month are checked one by one above; here we check them together,
    # so dates that don't exist (31 April, 30 February) are rejected.
    # with no year we check against 2000 (a leap year), so 29 February is allowed
    @model_validator(mode="after")
    def check_birthday_exists(self):
        year = self.birth_year if self.birth_year is not None else 2000
        days_in_month = calendar.monthrange(year, self.birth_month)[1]
        if self.birth_day > days_in_month:
            month = MONTH_NAMES[self.birth_month - 1]
            if self.birth_year is None:
                raise ValueError(f"birthday: {self.birth_day} {month} is not a real date")
            raise ValueError(f"birthday: {self.birth_day} {month} {self.birth_year} is not a real date")
        return self

    # only undergraduates have a level, and "other" has no department,
    # so anything sent for those is dropped instead of being saved
    @model_validator(mode="after")
    def keep_fields_for_member_type(self):
        if self.member_type != "undergraduate":
            self.level = None
        if self.member_type == "other":
            self.department = None
        return self

class MemberOut(BaseModel):
    id: int
    full_name: str
    phone: str
    email: str | None
    gender: str | None
    member_type: str
    department: str | None
    level: str | None
    hostel_or_address: str | None
    birth_day: int
    birth_month: int
    birth_year: int | None
    joined_whatsapp_consent: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
