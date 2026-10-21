from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin
from app.schemas import LoginRequest, TokenResponse
from app.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    admin = db.scalar(select(Admin).where(Admin.email == data.email))
    if not admin or not verify_password(data.password, admin.password_hash) or not admin.is_active:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(admin.id, admin.role)
    return TokenResponse(access_token=token)

