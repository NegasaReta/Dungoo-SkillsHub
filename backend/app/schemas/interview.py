from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class Question(BaseModel):
    id: str
    text: str
    competency: str


class RoleOption(BaseModel):
    slug: str
    label: str


class TurnQuestion(BaseModel):
    """The interviewer's next question, chosen from the fixed bank."""

    turn_index: int
    question_id: str
    text: str
    competency: str
    is_final: bool
    max_turns: int


class TurnAnswerRead(BaseModel):
    turn_index: int
    question_id: str
    transcript: str


class SessionCreate(BaseModel):
    """Role only — the signed-in user comes from the JWT, not the request body."""

    role: str


class EngagementSummary(BaseModel):
    """
    Aggregated visual signals, measured on the candidate's device.

    Ratios rather than raw landmarks: the browser sends one of these per session,
    never per frame, so no video or frame data reaches the server.
    """

    eye_contact: float = Field(0.0, ge=0.0, le=1.0)
    head_stability: float = Field(0.0, ge=0.0, le=1.0)
    expression_variety: float = Field(0.0, ge=0.0, le=1.0)
    samples: int = Field(0, ge=0)
    duration_seconds: float = Field(0.0, ge=0.0)


class SessionComplete(BaseModel):
    """Body for ending a session. Engagement is optional: consent can be withdrawn,
    the camera can be off, and the device may be too slow to track anything."""

    engagement: EngagementSummary | None = None


class SessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    role: str
    status: str
    started_at: datetime
    completed_at: datetime | None


class SessionSummaryRead(SessionRead):
    """Engagement is reported as plain observations, never as a score."""

    engagement_notes: list[str] = []


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
