"""Placeholder for authentication helpers.

Password hashing and token issuing land here once auth is part of the scope.
"""

from app.core.config import settings


def get_secret_key() -> str:
    return settings.SECRET_KEY
