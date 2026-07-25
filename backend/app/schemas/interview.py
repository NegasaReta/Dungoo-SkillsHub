from datetime import datetime

from pydantic import BaseModel, ConfigDict


class Question(BaseModel):
    id: str
    text: str
    competency: str


class SessionCreate(BaseModel):
    user_id: int
    role: str


class SessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    role: str
    status: str
    started_at: datetime
    completed_at: datetime | None


class ResponseSubmit(BaseModel):
    question_id: str
    transcript: str


class FeedbackRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    question_id: str
    clarity_score: float
    confidence_score: float
    star_score: float
    summary: str
    strengths: list[str]
    improvements: list[str]
