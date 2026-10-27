from app.config import settings
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
from datetime import datetime, timezone, timedelta
import jwt

password_hash = PasswordHash((BcryptHasher(),))

def hash_password(password: str) -> str:
    return password_hash.hash(password)

# bcrypt only looks at the first 72 bytes of a password and the bcrypt library raises
# an error (a 500) for anything longer, so longer passwords are treated as wrong
BCRYPT_MAX_BYTES = 72

def verify_password(plain: str, hashed: str) -> bool:
    if len(plain.encode("utf-8")) > BCRYPT_MAX_BYTES:
        return False
    return password_hash.verify(plain, hashed)

# a real bcrypt hash of a random password nobody knows. When the email isn't found we
# still check the password against this, so a wrong email takes as long as a wrong
# password and an attacker can't time the answer to learn which emails are admins
DUMMY_PASSWORD_HASH = hash_password("no-admin-has-this-password-8f3a1c")

def verify_password_or_dummy(plain: str, hashed: str | None) -> bool:
    if len(plain.encode("utf-8")) > BCRYPT_MAX_BYTES:
        # still spend the same time as a normal check, then say no
        password_hash.verify("x", DUMMY_PASSWORD_HASH)
        return False
    if hashed is None:
        verify_password(plain, DUMMY_PASSWORD_HASH)
        return False
    return verify_password(plain, hashed)

def create_access_token(admin_id: int, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(admin_id), "role": role, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

def decode_token(token: str) -> dict | None:
    try:
        # algorithms=[...] pins the one algorithm we sign with (the token can't choose another),
        # and "require" refuses tokens with no expiry time or no admin id
        return jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
            options={"require": ["exp", "sub"]},
        )
    except jwt.InvalidTokenError:
        return None
