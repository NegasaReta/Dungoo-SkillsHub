from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    target_role: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    target_role: str
    created_at: datetime
