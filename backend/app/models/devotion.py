from datetime import date, datetime
from sqlalchemy import String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

#Devotion table
class Devotion(Base):
    __tablename__ = "devotions"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)

    scripture: Mapped[str] = mapped_column(String(120), nullable=False)

    body: Mapped[str] = mapped_column(Text, nullable=False)

    author: Mapped[str | None] = mapped_column(String(120), nullable=True)

    devotion_date: Mapped[date] = mapped_column(nullable=False, unique=True)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

