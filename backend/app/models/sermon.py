from datetime import date, datetime
from sqlalchemy import String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

#Sermon table
class Sermon(Base):
    __tablename__ = "sermons"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    preacher: Mapped[str] = mapped_column(String(120), nullable=False)

    preached_on: Mapped[date] 
    
    scripture: Mapped[str | None] = mapped_column(String(120), nullable=True)
    
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())