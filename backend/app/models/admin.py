from datetime import datetime
from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

#Admin table
class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(primary_key=True)

    full_name: Mapped[str] = mapped_column(String(120), nullable=False)

    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    role: Mapped[str] = mapped_column(String(20), nullable=False, server_default="editor")
    
    is_active: Mapped[bool] = mapped_column(nullable=False, server_default="true")
    
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)



