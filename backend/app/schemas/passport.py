from datetime import datetime

from pydantic import BaseModel


class Milestone(BaseModel):
    """Ids travel instead of labels so the UI can translate them (NFR-4)."""

    id: str
    achieved: bool


class PassportSession(BaseModel):
    """One completed interview, as it appears in the passport's history."""

    session_id: int
    role: str
    role_label: str
    completed_at: datetime | None
    answers_scored: int
    scores: dict[str, float]
    overall: float


class PassportRead(BaseModel):
    """The credential itself: everything the passport screen renders.

    `level` and `milestone` ids are keys, not copy. Scores are on the 1-5 rubric,
    with 0 meaning "not scored yet" rather than a failing mark.
    """

    holder_name: str
    role: str
    role_label: str
    level: str
    overall: float
    scores: dict[str, float]
    sessions_completed: int
    answers_scored: int
    strengths: list[str]
    focus_areas: list[str]
    milestones: list[Milestone]
    # Oldest first, so a progress chart can plot it straight through.
    history: list[PassportSession]
    updated_at: datetime
