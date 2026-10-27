import pytest
from pydantic import ValidationError

from app.config import BACKEND_DIR, Settings

GOOD_KEY = "k" * 32


def make_settings(**changes):
    values = {"database_url": "postgresql+psycopg://u:p@localhost/db", "secret_key": GOOD_KEY, **changes}
    return Settings(**values)


def test_good_settings_are_accepted():
    settings = make_settings()

    assert settings.algorithm == "HS256"


def test_short_secret_key_is_refused():
    with pytest.raises(ValidationError):
        make_settings(secret_key="short-key")


def test_example_secret_key_from_env_example_is_refused():
    with pytest.raises(ValidationError):
        make_settings(secret_key="change-me-to-a-long-random-string")


def test_missing_secret_key_is_refused(monkeypatch):
    monkeypatch.delenv("SECRET_KEY", raising=False)
    with pytest.raises(ValidationError):
        Settings(_env_file=None, database_url="postgresql+psycopg://u:p@localhost/db")


def test_algorithm_none_is_refused():
    with pytest.raises(ValidationError):
        make_settings(algorithm="none")


def test_asymmetric_algorithm_is_refused():
    with pytest.raises(ValidationError):
        make_settings(algorithm="RS256")


def test_cors_wildcard_is_refused():
    with pytest.raises(ValidationError):
        make_settings(cors_origins="*")


def test_cors_origins_are_split_and_trimmed():
    settings = make_settings(cors_origins="http://localhost:5173, https://chapeloffaith.org ,")

    assert settings.cors_origin_list == ["http://localhost:5173", "https://chapeloffaith.org"]


def test_media_dir_defaults_to_backend_media():
    settings = make_settings(media_dir="media")

    assert settings.media_dir == BACKEND_DIR / "media"
    assert settings.media_dir.is_absolute()


def test_relative_media_dir_is_taken_from_the_backend_folder():
    settings = make_settings(media_dir="uploads/images")

    assert settings.media_dir == BACKEND_DIR / "uploads" / "images"


def test_unknown_time_zone_is_refused():
    with pytest.raises(ValidationError):
        make_settings(church_timezone="Mars/Olympus")
