from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Admin
from app.security import decode_token

bearer = HTTPBearer(auto_error=False)

# the biggest number a Postgres "integer" id column can hold
MAX_DB_ID = 2_147_483_647

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

    # "sub" holds the admin's id as text. Anything else (letters, a huge number that
    # doesn't fit in the database's id column) is a bad token, so 401 instead of a crash
    admin_id = payload.get("sub")
    if not isinstance(admin_id, str) or not (admin_id.isascii() and admin_id.isdigit()) or int(admin_id) > MAX_DB_ID:
        raise credentials_error

    admin = db.get(Admin, int(admin_id))
    if not admin or not admin.is_active:
        raise credentials_error
    return admin

def require_role(*roles: str):
    def checker(admin: Admin = Depends(get_current_admin)) -> Admin:
        if admin.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
        return admin
    return checker


