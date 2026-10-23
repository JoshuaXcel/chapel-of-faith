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

