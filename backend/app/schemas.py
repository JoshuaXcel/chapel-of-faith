from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from datetime import date, datetime
from typing import Literal
import calendar

class LoginRequest(BaseModel):
    email: str
    password: str

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
    title: str
    description: str | None = None
    location: str
    starts_at: datetime
    ends_at: datetime | None = None
    image_url: str | None = None

class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    image_url: str | None = None

    # these fields can't be empty in the database, so null gives 422 instead of a 500
    @field_validator("title", "location", "starts_at")
    @classmethod
    def reject_null(cls, value):
        if value is None:
            raise ValueError("cannot be null")
        return value

class SermonCreate(BaseModel):
    title: str
    description: str | None = None
    preacher: str
    preached_on: date
    scripture: str | None = None
    audio_url: str | None = None

class SermonUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    preacher: str | None = None
    preached_on: date | None = None
    scripture: str | None = None
    audio_url: str | None = None

    # these fields can't be empty in the database, so null gives 422 instead of a 500
    @field_validator("title", "preacher", "preached_on")
    @classmethod
    def reject_null(cls, value):
        if value is None:
            raise ValueError("cannot be null")
        return value

class DevotionCreate(BaseModel):
    title: str
    scripture: str
    body: str
    devotion_date: date
    author: str | None = None

class DevotionUpdate(BaseModel):
    title: str | None = None
    scripture: str | None = None
    body: str | None = None
    devotion_date: date | None = None
    author: str | None = None

    # these fields can't be empty in the database, so null gives 422 instead of a 500
    @field_validator("title", "scripture", "body", "devotion_date")
    @classmethod
    def reject_null(cls, value):
        if value is None:
            raise ValueError("cannot be null")
        return value

class LeadershipCreate(BaseModel):
    name: str
    role: str
    bio: str | None = None
    photo_url: str | None = None
    display_order: int = 0

class LeadershipUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    bio: str | None = None
    photo_url: str | None = None
    display_order: int | None = None

    # these fields can't be empty in the database, so null gives 422 instead of a 500
    @field_validator("name", "role", "display_order")
    @classmethod
    def reject_null(cls, value):
        if value is None:
            raise ValueError("cannot be null")
        return value

class GalleryImageCreate(BaseModel):
    image_url: str
    caption: str | None = None

class GalleryImageUpdate(BaseModel):
    image_url: str | None = None
    caption: str | None = None

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
    email: str | None = Field(default=None, max_length=255)
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
        this_year = date.today().year
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
