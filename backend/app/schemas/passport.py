from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PassportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    role: str
    scores: dict[str, float]
    sessions_completed: int
    updated_at: datetime
