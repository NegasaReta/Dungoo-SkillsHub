import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.constants import EDUCATION_LEVELS, INDUSTRIES, LANGUAGES

E164_PATTERN = re.compile(r"^\+[1-9]\d{7,14}$")
SEPARATORS_PATTERN = re.compile(r"[\s().\-]")
ETHIOPIA_COUNTRY_CODE = "+251"


def normalize_phone_number(value: str) -> str:
    """Accept the local Ethiopian forms the signup form allows, store E.164.

    0912345678, 912345678, and 251912345678 all become +251912345678. Numbers
    that already carry a country code are only checked, never rewritten.
    """
    compact = SEPARATORS_PATTERN.sub("", value.strip())

    if compact.startswith("00"):
        compact = f"+{compact[2:]}"

    if not compact.startswith("+"):
        if compact.startswith("251"):
            compact = f"+{compact}"
        elif re.fullmatch(r"0[79]\d{8}", compact):
            compact = f"{ETHIOPIA_COUNTRY_CODE}{compact[1:]}"
        elif re.fullmatch(r"[79]\d{8}", compact):
            compact = f"{ETHIOPIA_COUNTRY_CODE}{compact}"

    if not E164_PATTERN.match(compact):
        raise ValueError(
            "phone_number must be a plausible phone number, "
            "e.g. +251912345678 or 0912345678"
        )
    return compact


def compose_full_name(
    full_name: str | None = None,
    first_name: str | None = None,
    last_name: str | None = None,
) -> str | None:
    """Reduce either naming style to the single name that gets stored.

    The frontend works in first_name/last_name; curl and the SRS use full_name.
    Whichever arrives, one collapsed string comes out, or None if nothing usable
    was sent.
    """
    if full_name and full_name.strip():
        return " ".join(full_name.split())

    parts = [part.strip() for part in (first_name, last_name) if part and part.strip()]
    return " ".join(parts) if parts else None


class NamedRequest(BaseModel):
    """Shared by signup and profile completion, which accept either name style."""

    full_name: str | None = None
    first_name: str | None = None
    last_name: str | None = None

    @property
    def resolved_full_name(self) -> str | None:
        return compose_full_name(self.full_name, self.first_name, self.last_name)


class SignupRequest(NamedRequest):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {"email": "abebe@example.com", "password": "supersecret123"}
        }
    )

    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {"email": "abebe@example.com", "password": "supersecret123"}
        }
    )

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    profile_completed: bool


class ProfileCompleteRequest(NamedRequest):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "full_name": "Abebe Kebede",
                "education_level": "bachelor",
                "industries": ["tech", "education"],
                "phone_number": "+251912345678",
                "languages": ["amharic", "english"],
            }
        }
    )

    education_level: str
    industries: list[str] = Field(min_length=1)
    phone_number: str
    languages: list[str] = Field(min_length=1)

    @field_validator("education_level")
    @classmethod
    def validate_education_level(cls, value: str) -> str:
        if value not in EDUCATION_LEVELS:
            raise ValueError(
                f"Invalid education_level '{value}'. Allowed: {', '.join(EDUCATION_LEVELS)}"
            )
        return value

    @field_validator("industries")
    @classmethod
    def validate_industries(cls, values: list[str]) -> list[str]:
        if not values:
            raise ValueError("At least one industry is required")
        unknown = sorted({v for v in values if v not in INDUSTRIES})
        if unknown:
            raise ValueError(
                f"Invalid industries: {', '.join(unknown)}. Allowed: {', '.join(INDUSTRIES)}"
            )
        return values

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, value: str) -> str:
        return normalize_phone_number(value)

    @field_validator("languages")
    @classmethod
    def validate_languages(cls, values: list[str]) -> list[str]:
        if not values:
            raise ValueError("At least one language is required")
        unknown = sorted({v for v in values if v not in LANGUAGES})
        if unknown:
            raise ValueError(
                f"Invalid languages: {', '.join(unknown)}. Allowed: {', '.join(LANGUAGES)}"
            )
        return values


class UserMe(BaseModel):
    """first_name and last_name are split from the stored name for the frontend."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str | None
    first_name: str | None
    last_name: str | None
    education_level: str | None
    industries: list[str]
    phone_number: str | None
    languages: list[str]
    profile_completed: bool
    created_at: datetime


class MetaOptions(BaseModel):
    education_levels: list[str]
    industries: list[str]
    languages: list[str]
