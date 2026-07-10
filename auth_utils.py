"""
Authentication utilities: password hashing, JWT creation/validation.
"""

import hashlib
import os
import time
from typing import Optional

try:
    import jwt
except ImportError:
    jwt = None  # type: ignore

# ---------------------------------------------------------------------------
# Password handling  (deterministic SHA-256 with a random per-user salt)
# ---------------------------------------------------------------------------

ALGORITHM = "pbkdf2_sha256"
_SALT_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"


def _random_salt(length: int = 16) -> str:
    """Cryptographically random salt."""
    return os.urandom(length).hex()


def hash_password(password: str) -> str:
    """Return a string like ``pbkdf2_sha256$<salt>$<hash>``."""
    salt = _random_salt()
    h = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000
    ).hex()
    return f"{ALGORITHM}${salt}${h}"


def check_password(password: str, stored: str) -> bool:
    """Verify a password against a stored hash."""
    parts = stored.split("$")
    if len(parts) != 3:
        return False
    _, salt, expected = parts
    h = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000
    ).hex()
    return h == expected


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

# In production, read this from an env variable / secret store
_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-in-prod-0123456789abc")
_JWT_ALGO = "HS256"
_TOKEN_TTL = 3600  # 1 hour


def create_token(user_id: int, email: str) -> str:
    """Issue a signed JWT for the given user."""
    if jwt is None:
        raise RuntimeError("PyJWT is not installed (pip install pyjwt)")
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": int(time.time()),
        "exp": int(time.time()) + _TOKEN_TTL,
    }
    return jwt.encode(payload, _SECRET, algorithm=_JWT_ALGO)


def decode_token(token: str) -> Optional[dict]:
    """Return the payload if the token is valid, else None."""
    if jwt is None:
        raise RuntimeError("PyJWT is not installed (pip install pyjwt)")
    try:
        return jwt.decode(token, _SECRET, algorithms=[_JWT_ALGO])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
