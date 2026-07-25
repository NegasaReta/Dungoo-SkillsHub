import json
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import FeedbackReport, InterviewSession, User, utcnow
from app.schemas.interview import (
    FeedbackRead,
    Question,
    ResponseSubmit,
    SessionCreate,
    SessionRead,
)
from app.services import ai_scoring

QUESTIONS_PATH = Path(__file__).resolve().parent.parent / "data" / "questions.json"

router = APIRouter(prefix="/interview", tags=["interview"])


@lru_cache
def load_questions() -> dict[str, list[dict]]:
    return json.loads(QUESTIONS_PATH.read_text())


def get_question(role: str, question_id: str) -> dict:
    for question in load_questions().get(role, []):
        if question["id"] == question_id:
            return question
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Question not found for this role")


@router.get("/questions", response_model=list[Question])
def list_questions(role: str) -> list[dict]:
    questions = load_questions().get(role)
    if questions is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No question bank for this role")
    return questions


@router.post("/sessions", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
def create_session(payload: SessionCreate, db: Session = Depends(get_db)) -> InterviewSession:
    if db.get(User, payload.user_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    session = InterviewSession(user_id=payload.user_id, role=payload.role)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post(
    "/sessions/{session_id}/responses",
    response_model=FeedbackRead,
    status_code=status.HTTP_201_CREATED,
)
def submit_response(
    session_id: int, payload: ResponseSubmit, db: Session = Depends(get_db)
) -> FeedbackReport:
    session = db.get(InterviewSession, session_id)
    if session is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")

    question = get_question(session.role, payload.question_id)
    scores = ai_scoring.score_answer(session.role, question["text"], payload.transcript)

    report = FeedbackReport(
        session_id=session.id,
        question_id=payload.question_id,
        transcript=payload.transcript,
        clarity_score=scores["clarity"],
        confidence_score=scores["confidence"],
        star_score=scores["star"],
        summary=scores["summary"],
        strengths=scores["strengths"],
        improvements=scores["improvements"],
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.post("/sessions/{session_id}/complete", response_model=SessionRead)
def complete_session(session_id: int, db: Session = Depends(get_db)) -> InterviewSession:
    session = db.get(InterviewSession, session_id)
    if session is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")

    session.status = "completed"
    session.completed_at = utcnow()
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions/{session_id}/feedback", response_model=list[FeedbackRead])
def list_feedback(session_id: int, db: Session = Depends(get_db)) -> list[FeedbackReport]:
    session = db.get(InterviewSession, session_id)
    if session is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    return session.reports
