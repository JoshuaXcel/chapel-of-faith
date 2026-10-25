from datetime import date, datetime
from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

#Member table (people who register through the membership form on the website)
class Member(Base):
    __tablename__ = "members"

    id: Mapped[int] = mapped_column(primary_key=True)

    full_name: Mapped[str] = mapped_column(String(120), nullable=False)

    phone: Mapped[str] = mapped_column(String(30), nullable=False)

    email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)

    department: Mapped[str | None] = mapped_column(String(120), nullable=True)

    level: Mapped[str | None] = mapped_column(String(20), nullable=True)

    hostel_or_address: Mapped[str | None] = mapped_column(String(255), nullable=True)

    birthday: Mapped[date | None] = mapped_column(nullable=True)

    # ticked "add me to the church WhatsApp groups" on the form
    joined_whatsapp_consent: Mapped[bool] = mapped_column(nullable=False, server_default="false")

    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
