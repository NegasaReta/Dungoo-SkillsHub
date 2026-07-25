import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.constants import EDUCATION_LEVELS, INDUSTRIES, LANGUAGES

PHONE_PATTERN = re.compile(r"^\+[1-9]\d{7,14}$")


class SignupRequest(BaseModel):
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


class ProfileCompleteRequest(BaseModel):
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

    full_name: str = Field(min_length=1)
    education_level: str
    industries: list[str] = Field(min_length=1)
    phone_number: str
    languages: list[str] = Field(min_length=1)

    @field_validator("full_name")
    @classmethod
    def strip_full_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("full_name is required")
        return cleaned

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
        cleaned = value.strip()
        if not PHONE_PATTERN.match(cleaned):
            raise ValueError(
                "phone_number must be a plausible E.164 number, e.g. +251912345678"
            )
        return cleaned

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
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str | None
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
