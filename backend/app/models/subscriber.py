from datetime import datetime
from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

#Subscriber table
class Subscriber(Base):
    __tablename__ = "subscribers"

    id: Mapped[int] = mapped_column(primary_key=True)

    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

