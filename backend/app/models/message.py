from datetime import datetime
from sqlalchemy import String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

#Message table
class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(120), nullable=False)

    email: Mapped[str] = mapped_column(String(255), nullable=False)

    subject: Mapped[str | None] = mapped_column(String(200), nullable=True)

    body: Mapped[str] = mapped_column(Text, nullable=False)

    is_read: Mapped[bool] = mapped_column(nullable=False, server_default="false")

    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

