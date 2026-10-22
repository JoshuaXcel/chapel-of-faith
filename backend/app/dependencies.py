from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Admin
from app.security import decode_token

bearer = HTTPBearer(auto_error=False)

credentials_error = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> Admin:
    if not credentials:
        raise credentials_error

    payload = decode_token(credentials.credentials)
    if payload is None:
        raise credentials_error
        
    admin = db.get(Admin, int(payload["sub"]))
    if not admin or not admin.is_active:
        raise credentials_error
    return admin








"""1. New file app/dependencies.py
* bearer = HTTPBearer(auto_error=False) (from fastapi.security). auto_error=False means WE decide the error, so it's always 401.
* function get_current_admin(credentials = Depends(bearer), db = Depends(get_db)) → returns Admin. Same def/async style as your login.
* Steps inside:
  - no credentials → 401
  - payload = decode_token(credentials.credentials); None → 401
  - admin = db.get(Admin, int(payload["sub"])) (sub is a string in the token)
  - admin missing OR not is_active → 401
  - return admin
* Every 401: detail "Could not validate credentials", headers={"WWW-Authenticate": "Bearer"}. Tip: make one exception at the top and raise it each time."""