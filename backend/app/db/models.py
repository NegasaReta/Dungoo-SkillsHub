from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.db.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    education_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    industries: Mapped[list[str]] = mapped_column(JSON, default=list)
    phone_number: Mapped[str | None] = mapped_column(String(32), nullable=True)
    languages: Mapped[list[str]] = mapped_column(JSON, default=list)
    profile_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    interview_sessions: Mapped[list["InterviewSession"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    passport: Mapped["SkillPassport | None"] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )
    reset_tokens: Mapped[list["PasswordResetToken"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    exchange_sessions: Mapped[list["ExchangeSession"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    # The frontend edits names as two fields while one column is stored, so the
    # split happens on read. Splitting once keeps "Abebe Kebede Bekele" intact as
    # first "Abebe", last "Kebede Bekele".
    @property
    def first_name(self) -> str | None:
        if not self.full_name:
            return None
        return self.full_name.split(" ", 1)[0]

    @property
    def last_name(self) -> str | None:
        if not self.full_name:
            return None
        parts = self.full_name.split(" ", 1)
        return parts[1] if len(parts) > 1 else None


class PasswordResetToken(Base):
    """Single-use password reset grant.

    Only the hash is stored, so a leaked database row cannot be replayed as a
    reset link.
    """

    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship(back_populates="reset_tokens")


class ExchangeSession(Base):
    """A peer language-exchange session, timed by the server (FR-2).

    The free tier allows 40 minutes a day, so the duration decides what a user is
    still entitled to. That makes it the one number a client must not be trusted
    to report: the clock is kept here instead, as timestamps the server writes.

    `accumulated_seconds` is time already banked from earlier run stretches, and
    `resumed_at` is when the current stretch began, or NULL while paused. Elapsed
    time is the sum of the two, so pausing costs nothing and a client that
    disappears mid-session cannot keep the clock running past the daily cap.
    """

    __tablename__ = "exchange_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    # Copied rather than referenced: peers live in a JSON directory today, and a
    # finished session should still read correctly once that becomes a real table.
    peer_id: Mapped[int] = mapped_column(Integer)
    peer_name: Mapped[str] = mapped_column(String(120))
    # Kept as two directions rather than one merged list, because "they taught me
    # English" and "I taught them English" are different sessions, and a page
    # restored after a reload has nothing else to reconstruct the split from.
    teaches: Mapped[list[str]] = mapped_column(JSON, default=list)
    learns: Mapped[list[str]] = mapped_column(JSON, default=list)
    mutual: Mapped[bool] = mapped_column(Boolean, default=False)

    status: Mapped[str] = mapped_column(String(20), default="active", index=True)
    accumulated_seconds: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    resumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="exchange_sessions")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    role: Mapped[str] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(20), default="in_progress")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # Aggregated on the candidate's device and posted once when the call ends. Raw
    # frames never reach the server, so this is the only visual record there is.
    engagement: Mapped[dict] = mapped_column(JSON, default=dict)
    # question id -> the sentence said before that question, settled when the
    # session starts so no turn waits on the model mid-conversation.
    lead_ins: Mapped[dict] = mapped_column(JSON, default=dict)

    user: Mapped[User] = relationship(back_populates="interview_sessions")
    reports: Mapped[list["FeedbackReport"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )
    turns: Mapped[list["InterviewTurn"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="InterviewTurn.turn_index",
    )


class InterviewTurn(Base):
    """One question-and-answer exchange, stored so the next question can build on it."""

    __tablename__ = "interview_turns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("interview_sessions.id"), index=True)
    turn_index: Mapped[int] = mapped_column(Integer)
    question_id: Mapped[str] = mapped_column(String(64))
    question_text: Mapped[str] = mapped_column(Text)
    transcript: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    session: Mapped[InterviewSession] = relationship(back_populates="turns")


class FeedbackReport(Base):
    """AI scoring result for a single answer within a session."""

    __tablename__ = "feedback_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("interview_sessions.id"), index=True)
    question_id: Mapped[str] = mapped_column(String(64))
    transcript: Mapped[str] = mapped_column(Text, default="")
    clarity_score: Mapped[float] = mapped_column(Float, default=0.0)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    star_score: Mapped[float] = mapped_column(Float, default=0.0)
    summary: Mapped[str] = mapped_column(Text, default="")
    strengths: Mapped[list[str]] = mapped_column(JSON, default=list)
    improvements: Mapped[list[str]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    session: Mapped[InterviewSession] = relationship(back_populates="reports")


class SkillPassport(Base):
    __tablename__ = "skill_passports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    role: Mapped[str] = mapped_column(String(120))
    scores: Mapped[dict[str, float]] = mapped_column(JSON, default=dict)
    sessions_completed: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    user: Mapped[User] = relationship(back_populates="passport")
