from datetime import datetime, timedelta, timezone
from typing import Optional

import hashlib
import bcrypt

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from config import settings

_bearer = HTTPBearer()


# ── Password helpers ───────────────────────────────────────────

def _normalize_password(password: str) -> bytes:
    """SHA256 the password to handle >72-byte inputs, then return as bytes."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest().encode("utf-8")


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(_normalize_password(plain), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_normalize_password(plain), hashed.encode("utf-8"))
    except Exception:
        return False


# ──────────────────────────────────────────────
# JWT helpers
# ──────────────────────────────────────────────

def create_access_token(payload: dict) -> str:
    data = payload.copy()

    # optional expiration
    if hasattr(settings, "JWT_EXPIRE_MINUTES") and settings.JWT_EXPIRE_MINUTES:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
        data["exp"] = expire

    return jwt.encode(data, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        return None


# ──────────────────────────────────────────────
# FastAPI dependencies
# ──────────────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    token = credentials.credentials
    payload = decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin only",
        )

    return user