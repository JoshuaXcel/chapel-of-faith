from pathlib import Path
from typing import Literal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# the backend/ folder. Paths in settings are resolved from here, not from wherever
# uvicorn happens to be started, so the app always finds the same media folder
BACKEND_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    """App settings, loaded from the .env file."""

    database_url: str
    secret_key: str
    # only HMAC algorithms are allowed. The token is signed and checked with the same
    # secret key, and a value like "none" would let anyone make their own tokens
    algorithm: Literal["HS256", "HS384", "HS512"] = "HS256"
    access_token_expire_minutes: int = 60
    # websites allowed to call this API from the browser (the React frontend).
    # Several can be given, separated by commas, e.g. "http://localhost:5173,https://chapeloffaith.org"
    cors_origins: str = "http://localhost:5173"
    # where uploaded images are saved. A relative path is taken from the backend/ folder
    media_dir: Path = BACKEND_DIR / "media"
    # the church's time zone. "Today's devotion" and "upcoming events" use this clock,
    # because the server itself may run in another zone (most cloud servers use UTC)
    church_timezone: str = "Africa/Lagos"
    # only used by the tests (see tests/conftest.py)
    test_database_url: str | None = None

    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8")

    # the secret key signs every login token. If someone guesses it, they can make a
    # token for any admin, so a short key or the example value from .env.example is refused
    @field_validator("secret_key")
    @classmethod
    def check_secret_key(cls, value):
        if len(value) < 32 or "change-me" in value.lower():
            raise ValueError(
                "SECRET_KEY must be a random string of at least 32 characters (not the example value). "
                "Make one with: python -c \"import secrets; print(secrets.token_urlsafe(32))\""
            )
        return value

    # "*" would let every website on the internet call the admin API from a browser
    @field_validator("cors_origins")
    @classmethod
    def check_cors_origins(cls, value):
        if "*" in value:
            raise ValueError("CORS_ORIGINS must list real website addresses, \"*\" is not allowed")
        return value

    @field_validator("media_dir")
    @classmethod
    def make_media_dir_absolute(cls, value):
        if not value.is_absolute():
            value = BACKEND_DIR / value
        return value.resolve()

    # fail at startup with a clear message instead of on the first request
    @field_validator("church_timezone")
    @classmethod
    def check_timezone(cls, value):
        try:
            ZoneInfo(value)
        except (ZoneInfoNotFoundError, ValueError):
            raise ValueError(f"unknown time zone: {value}")
        return value

    # the list of origins, with spaces and empty entries removed
    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

settings = Settings()
