from datetime import datetime
from sqlalchemy import String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

#Leadership table
class Leadership(Base):
    __tablename__ = "leadership"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(120), nullable=False)

    role: Mapped[str] = mapped_column(String(120), nullable=False)

    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    display_order: Mapped[int] = mapped_column(nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

