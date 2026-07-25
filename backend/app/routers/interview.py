import logging

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.db.models import FeedbackReport, InterviewSession, InterviewTurn, User, utcnow
from app.schemas.interview import (
    FeedbackRead,
    Question,
    ResponseSubmit,
    RoleOption,
    SessionComplete,
    SessionCreate,
    SessionRead,
    SessionSummaryRead,
    TurnAnswerRead,
    TurnQuestion,
)
from app.services import (
    ai_scoring,
    engagement,
    lead_ins,
    passport_builder,
    question_bank,
    question_selector,
    session_scoring,
    transcription,
    tts,
)

router = APIRouter(prefix="/interview", tags=["interview"])

logger = logging.getLogger(__name__)

# Provider failures name missing keys and quote upstream responses, which is what
# a developer needs in the log and exactly what a candidate must never be shown.
VOICE_UNAVAILABLE = "The interviewer's voice is unavailable right now."
TRANSCRIPTION_UNAVAILABLE = "We could not turn that answer into text. Please try again."


def _upstream_failure(detail: str, cause: Exception) -> HTTPException:
    logger.error("%s", cause)
    return HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail)


def _owned_session(session_id: int, user: User, db: Session) -> InterviewSession:
    """Someone else's session is reported as missing rather than forbidden."""
    session = db.get(InterviewSession, session_id)
    if session is None or session.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    return session


def _spoken_question(session: InterviewSession, chosen: dict) -> str:
    """The bank question with its lead-in in front, exactly as it will be said."""
    lead_in = (session.lead_ins or {}).get(chosen["id"]) or chosen.get("lead_in", "")
    return f"{lead_in} {chosen['text']}".strip()


def _get_turn(session: InterviewSession, turn_index: int) -> InterviewTurn:
    turn = next((item for item in session.turns if item.turn_index == turn_index), None)
    if turn is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Turn not found")
    return turn


@router.get("/roles", response_model=list[RoleOption])
def list_roles() -> list[dict]:
    return question_bank.roles()


@router.get("/questions", response_model=list[Question])
def list_questions(role: str) -> list[dict]:
    if not question_bank.has_role(role):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No question bank for this role")
    return question_bank.main_questions(role)


@router.post("/sessions", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InterviewSession:
    if not question_bank.has_role(payload.role):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No question bank for this role")

    # Settled here, while the candidate is still on the joining screen, so the
    # conversation itself never pauses for the model.
    session = InterviewSession(
        user_id=current_user.id,
        role=payload.role,
        lead_ins=lead_ins.for_session(payload.role, current_user),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post(
    "/sessions/{session_id}/turns/next",
    response_model=TurnQuestion,
    status_code=status.HTTP_201_CREATED,
)
def next_turn(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TurnQuestion:
    """Issue the next question, chosen from the bank and capped at INTERVIEW_MAX_TURNS."""
    session = _owned_session(session_id, current_user, db)
    asked = list(session.turns)

    if len(asked) >= question_selector.max_turns():
        raise HTTPException(status.HTTP_409_CONFLICT, "This interview has used all its turns")

    history = [
        {"question": turn.question_text, "transcript": turn.transcript}
        for turn in asked
        if turn.transcript
    ]
    chosen = question_selector.select_next(
        session.role, history=history, asked_ids=[turn.question_id for turn in asked]
    )
    if chosen is None:
        raise HTTPException(status.HTTP_409_CONFLICT, "No questions left for this role")

    # What gets stored is what gets spoken: the framing plus the bank question,
    # unchanged. Scoring reads this field, so it must match what the candidate heard.
    turn = InterviewTurn(
        session_id=session.id,
        turn_index=len(asked),
        question_id=chosen["id"],
        question_text=_spoken_question(session, chosen),
    )
    db.add(turn)
    db.commit()
    db.refresh(turn)

    return TurnQuestion(
        turn_index=turn.turn_index,
        question_id=turn.question_id,
        text=turn.question_text,
        competency=chosen["competency"],
        is_final=question_selector.is_final_turn(turn.turn_index),
        max_turns=question_selector.max_turns(),
    )


@router.get("/sessions/{session_id}/turns/{turn_index}/audio")
def turn_audio(
    session_id: int,
    turn_index: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """Speak a question that was already issued. Only bank text is ever synthesized."""
    session = _owned_session(session_id, current_user, db)
    turn = _get_turn(session, turn_index)

    try:
        speech = tts.synthesize(turn.question_text)
    except tts.SpeechError as error:
        raise _upstream_failure(VOICE_UNAVAILABLE, error) from error

    return Response(content=speech.audio, media_type=speech.media_type)


@router.post("/sessions/{session_id}/turns/{turn_index}/answer", response_model=TurnAnswerRead)
def submit_turn_answer(
    session_id: int,
    turn_index: int,
    audio: UploadFile = File(...),
    language: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InterviewTurn:
    """Transcribe a recorded answer and attach it to its turn."""
    session = _owned_session(session_id, current_user, db)
    turn = _get_turn(session, turn_index)

    payload = audio.file.read()
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "The uploaded recording was empty")

    try:
        turn.transcript = transcription.transcribe(
            payload,
            filename=audio.filename or "answer.webm",
            content_type=audio.content_type or "audio/webm",
            language=language,
        )
    except transcription.TranscriptionError as error:
        raise _upstream_failure(TRANSCRIPTION_UNAVAILABLE, error) from error

    db.commit()
    db.refresh(turn)
    return turn


@router.post(
    "/sessions/{session_id}/responses",
    response_model=FeedbackRead,
    status_code=status.HTTP_201_CREATED,
)
def submit_response(
    session_id: int,
    payload: ResponseSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FeedbackReport:
    """Per-answer scoring. Superseded by end-of-session scoring once that lands."""
    session = _owned_session(session_id, current_user, db)

    question = question_bank.get_question(session.role, payload.question_id)
    if question is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Question not found for this role")

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


@router.post("/sessions/{session_id}/complete", response_model=SessionSummaryRead)
def complete_session(
    session_id: int,
    payload: SessionComplete | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SessionSummaryRead:
    """Close the session, score its answers, and fold them into the passport.

    The session is marked complete before scoring runs, so a provider outage
    costs the candidate their feedback rather than the interview they just sat.

    The body is optional so a client that sends none still ends its session, and
    engagement within it is optional again for the camera-off case. What comes
    back are observations, never a score — see services/engagement.py.
    """
    session = _owned_session(session_id, current_user, db)
    session.status = "completed"
    session.completed_at = utcnow()

    if payload is not None and payload.engagement is not None:
        session.engagement = payload.engagement.model_dump()

    db.commit()

    session_scoring.score_session(db, session)
    passport_builder.rebuild(db, current_user)

    db.refresh(session)
    return SessionSummaryRead(
        **SessionRead.model_validate(session).model_dump(),
        engagement_notes=engagement.describe(session.engagement),
    )


@router.get("/sessions/{session_id}/feedback", response_model=list[FeedbackRead])
def list_feedback(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[FeedbackReport]:
    return _owned_session(session_id, current_user, db).reports
