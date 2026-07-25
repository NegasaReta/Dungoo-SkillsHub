"""Aggregation of scored interview answers into one Skill Passport.

The passport is the credential the product is judged on (SRS FR-6), so it is
derived from stored feedback reports every time it is asked for: it reads the
same after a refresh as it did the moment a session ended. Levels and milestones
leave here as ids rather than sentences, because the UI has to translate them.
"""

from collections.abc import Sequence

from sqlalchemy.orm import Session

from app.db.models import FeedbackReport, InterviewSession, SkillPassport, User
from app.schemas.passport import Milestone, PassportRead, PassportSession
from app.services import question_bank
from app.services.ai_scoring import UNSCORED

SKILL_DIMENSIONS = {
    "clarity": "clarity_score",
    "confidence": "confidence_score",
    "star": "star_score",
}

# Score floors, strongest first: an overall score takes the first band it clears.
LEVEL_BANDS = (
    (4.5, "standout"),
    (3.5, "interview_ready"),
    (2.5, "developing"),
    (1.0, "emerging"),
)
UNSCORED_LEVEL = "not_scored"

COMPLETED = "completed"
HIGHLIGHT_LIMIT = 3
STRONG_SCORE = 4.0
MILESTONE_SESSION_TARGET = 3
FALLBACK_ROLE = "general"


def aggregate_scores(reports: Sequence[FeedbackReport]) -> dict[str, float]:
    """Average each rubric dimension across the answers where it was scored.

    An axis the model left out stays out of its own average instead of counting
    as a zero, so one unscorable answer cannot sink a whole dimension.
    """
    scores = {}
    for skill, attribute in SKILL_DIMENSIONS.items():
        values = [
            value
            for report in reports
            if (value := getattr(report, attribute)) > UNSCORED
        ]
        scores[skill] = round(sum(values) / len(values), 2) if values else UNSCORED
    return scores


def overall_score(scores: dict[str, float]) -> float:
    """Mean of the dimensions that have a score. 0 until at least one does."""
    scored = [value for value in scores.values() if value > UNSCORED]
    return round(sum(scored) / len(scored), 2) if scored else UNSCORED


def level_for(overall: float) -> str:
    if overall <= UNSCORED:
        return UNSCORED_LEVEL
    return next(level for floor, level in LEVEL_BANDS if overall >= floor)


def highlights(reports: Sequence[FeedbackReport], field: str) -> list[str]:
    """Pick the newest distinct notes the scorer wrote on a given field.

    Newest first: the passport should show what the candidate is working on now,
    not the first thing they were ever told.
    """
    seen: set[str] = set()
    picked: list[str] = []

    for report in sorted(reports, key=lambda report: report.id, reverse=True):
        for note in getattr(report, field) or []:
            text = str(note).strip()
            if not text or text.casefold() in seen:
                continue
            seen.add(text.casefold())
            picked.append(text)
            if len(picked) == HIGHLIGHT_LIMIT:
                return picked

    return picked


def milestones(sessions_completed: int, scores: dict[str, float]) -> list[Milestone]:
    scored = [value for value in scores.values() if value > UNSCORED]
    every_skill_strong = len(scored) == len(SKILL_DIMENSIONS) and min(scored) >= STRONG_SCORE

    return [
        Milestone(id="first_session", achieved=sessions_completed >= 1),
        Milestone(
            id="three_sessions", achieved=sessions_completed >= MILESTONE_SESSION_TARGET
        ),
        Milestone(id="all_skills_strong", achieved=every_skill_strong),
    ]


def completed_sessions(user: User) -> list[InterviewSession]:
    """Finished sessions, oldest first.

    Ordered by id rather than `completed_at`: ids are handed out in order anyway,
    and they compare cleanly whether the driver returns aware datetimes or not.
    """
    return sorted(
        (session for session in user.interview_sessions if session.status == COMPLETED),
        key=lambda session: session.id,
    )


def session_history(sessions: Sequence[InterviewSession]) -> list[PassportSession]:
    """One entry per session that produced at least one score.

    A session whose answers never got scored is left out rather than plotted as a
    zero, which would read as a collapse in performance instead of missing data.
    """
    history = []
    for session in sessions:
        if not session.reports:
            continue
        scores = aggregate_scores(session.reports)
        history.append(
            PassportSession(
                session_id=session.id,
                role=session.role,
                role_label=role_label(session.role),
                completed_at=session.completed_at,
                answers_scored=len(session.reports),
                scores=scores,
                overall=overall_score(scores),
            )
        )
    return history


def role_label(role: str) -> str:
    """Human name for a role slug, from the bank when it knows one."""
    known = next((item["label"] for item in question_bank.roles() if item["slug"] == role), None)
    return known or role.replace("-", " ").replace("_", " ").title()


def current_role(user: User, sessions: Sequence[InterviewSession]) -> str:
    """What the passport is a credential *for*: the role practised most recently."""
    if sessions:
        return sessions[-1].role
    return user.industries[0] if user.industries else FALLBACK_ROLE


def rebuild(db: Session, user: User) -> SkillPassport:
    """Recompute the stored passport row from every scored answer the user has."""
    sessions = completed_sessions(user)
    reports = [report for session in sessions for report in session.reports]

    passport = user.passport or SkillPassport(user_id=user.id)
    passport.role = current_role(user, sessions)
    passport.scores = aggregate_scores(reports)
    passport.sessions_completed = len(sessions)

    db.add(passport)
    db.commit()
    db.refresh(passport)
    return passport


def build_credential(db: Session, user: User) -> PassportRead:
    """Refresh the stored row, then dress it with the fields the screen needs."""
    passport = rebuild(db, user)
    sessions = completed_sessions(user)
    reports = [report for session in sessions for report in session.reports]
    overall = overall_score(passport.scores)

    return PassportRead(
        holder_name=user.full_name or "",
        role=passport.role,
        role_label=role_label(passport.role),
        level=level_for(overall),
        overall=overall,
        scores=passport.scores,
        sessions_completed=passport.sessions_completed,
        answers_scored=len(reports),
        strengths=highlights(reports, "strengths"),
        focus_areas=highlights(reports, "improvements"),
        milestones=milestones(passport.sessions_completed, passport.scores),
        history=session_history(sessions),
        updated_at=passport.updated_at,
    )
