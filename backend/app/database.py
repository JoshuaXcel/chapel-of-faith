from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.config import settings

engine = create_engine(settings.database_url)

SessionLocal = sessionmaker(bind=engine, autoflush=False)

class Base(DeclarativeBase):
    """Parent class for every table (model) we create."""
    pass

def get_db():
    """Give each request its own database session, then close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
