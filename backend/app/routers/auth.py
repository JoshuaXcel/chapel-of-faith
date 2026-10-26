from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin
from app.schemas import AdminOut, LoginRequest, TokenResponse
from app.security import verify_password_or_dummy, create_access_token
from app.dependencies import get_current_admin
from app.rate_limit import client_ip, login_failures_per_email, login_failures_per_ip, too_many_requests

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    # emails are saved in lower case, so "Admin@Chapel.org" and "admin@chapel.org" are the same person
    email = data.email.strip().lower()
    ip = client_ip(request)
    email_key = f"{ip}|{email}"

    # too many wrong passwords recently: stop here (before checking the password),
    # so a script can't keep guessing
    wait = max(login_failures_per_email.retry_after(email_key), login_failures_per_ip.retry_after(ip))
    if wait:
        raise too_many_requests(wait, "Too many failed login attempts.")

    # lower() on the column too, so admins saved before this change (with capitals) still match
    admin = db.scalar(select(Admin).where(func.lower(Admin.email) == email))
    # the password is always checked, even when the email doesn't exist (see security.py)
    password_ok = verify_password_or_dummy(data.password, admin.password_hash if admin else None)
    if not admin or not password_ok or not admin.is_active:
        login_failures_per_email.hit(email_key)
        login_failures_per_ip.hit(ip)
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    # a successful login clears the count for this email
    login_failures_per_email.reset(email_key)
    token = create_access_token(admin.id, admin.role)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=AdminOut)
def read_me(admin: Admin = Depends(get_current_admin)):
    return admin
