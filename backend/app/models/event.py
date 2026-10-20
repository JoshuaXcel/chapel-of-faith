from datetime import datetime
from sqlalchemy import String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

#Event table
class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    location: Mapped[str] = mapped_column(String(200), nullable=False)

    starts_at: Mapped[datetime] = mapped_column(nullable=False)

    ends_at: Mapped[datetime | None] = mapped_column(nullable=True)

    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

