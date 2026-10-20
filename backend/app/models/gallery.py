from datetime import datetime
from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

#Gallery table
class GalleryImage(Base):
    __tablename__ = "gallery"

    id: Mapped[int] = mapped_column(primary_key=True)

    image_url: Mapped[str] = mapped_column(String(500), nullable=False)

    caption: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

