from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """App settings, loaded from the .env file."""

    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    # only used by the tests (see tests/conftest.py)
    test_database_url: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
