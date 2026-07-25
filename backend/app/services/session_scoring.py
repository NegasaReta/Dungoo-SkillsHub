"""Scoring of a finished interview: one feedback report per answered turn.

Scoring runs when the session ends rather than between questions, because a live
call cannot pause for a model round trip after every answer and the passport only
needs the numbers once the conversation is over. The calls go out together, so the
candidate waits for the slowest answer instead of the sum of all of them.
"""

import logging
from concurrent.futures import ThreadPoolExecutor

from sqlalchemy.orm import Session

from app.db.models import FeedbackReport, InterviewSession, InterviewTurn
from app.services import ai_scoring

MAX_PARALLEL_CALLS = 5

logger = logging.getLogger(__name__)


def pending_turns(session: InterviewSession) -> list[InterviewTurn]:
    """Answered turns with no report yet, so completing twice cannot double-score."""
    scored = {report.question_id for report in session.reports}
    return [
        turn
        for turn in session.turns
        if turn.transcript.strip() and turn.question_id not in scored
    ]


def score_session(db: Session, session: InterviewSession) -> list[FeedbackReport]:
    """Score every answer that is still unscored and store what came back."""
    turns = pending_turns(session)
    if not turns:
        return []

    role = session.role
    # Read on the thread that owns the Session: workers only see plain strings.
    answers = [(turn.turn_index, turn.question_text, turn.transcript) for turn in turns]

    with ThreadPoolExecutor(max_workers=min(len(answers), MAX_PARALLEL_CALLS)) as pool:
        results = list(pool.map(lambda answer: _score(role, *answer), answers))

    reports = [
        _report(session.id, turn, scores)
        for turn, scores in zip(turns, results, strict=True)
        if scores is not None
    ]

    db.add_all(reports)
    db.commit()
    return reports


def _score(role: str, turn_index: int, question: str, transcript: str) -> dict | None:
    """Score one answer, or return None when it could not be scored.

    A provider failure costs that answer its feedback. It must never cost the
    candidate the session they have just finished, so nothing is raised here.
    """
    try:
        scores = ai_scoring.score_answer(role, question, transcript)
    except Exception as error:  # noqa: BLE001 — any provider fault is one lost answer
        logger.error("Scoring failed for turn %s: %s", turn_index, error)
        return None

    # An all-zero result means the reply was unusable or no key is configured.
    # Storing it would plant a fake score in the passport average.
    if not any(scores[field] > ai_scoring.UNSCORED for field in ai_scoring.SCORE_FIELDS):
        logger.warning("Turn %s came back unscored: %s", turn_index, scores["summary"])
        return None

    return scores


def _report(session_id: int, turn: InterviewTurn, scores: dict) -> FeedbackReport:
    return FeedbackReport(
        session_id=session_id,
        question_id=turn.question_id,
        transcript=turn.transcript,
        clarity_score=scores["clarity"],
        confidence_score=scores["confidence"],
        star_score=scores["star"],
        summary=scores["summary"],
        strengths=scores["strengths"],
        improvements=scores["improvements"],
    )
