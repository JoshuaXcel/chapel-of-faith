from pydantic import BaseModel, ConfigDict
from datetime import date, datetime

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

class GalleryImageCreate(BaseModel):
    image_url: str
    caption: str | None = None

class GalleryImageUpdate(BaseModel):
    image_url: str | None = None
    caption: str | None = None
