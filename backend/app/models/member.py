from datetime import datetime
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

    # "undergraduate", "graduate", "staff" or "other" (checked in schemas.py)
    member_type: Mapped[str] = mapped_column(String(20), nullable=False)

    # department for undergraduates and staff, course studied for graduates, empty for "other"
    department: Mapped[str | None] = mapped_column(String(120), nullable=True)

    # only for undergraduates: 100L to 500L
    level: Mapped[str | None] = mapped_column(String(20), nullable=True)

    hostel_or_address: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # birthday: day and month are required, the year is optional (not everyone wants to share their age)
    birth_day: Mapped[int] = mapped_column(nullable=False)

    birth_month: Mapped[int] = mapped_column(nullable=False)

    birth_year: Mapped[int | None] = mapped_column(nullable=True)

    # ticked "add me to the church WhatsApp groups" on the form
    joined_whatsapp_consent: Mapped[bool] = mapped_column(nullable=False, server_default="false")

    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
