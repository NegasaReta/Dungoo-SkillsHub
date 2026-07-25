from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import FeedbackReport, InterviewSession, SkillPassport, User
from app.schemas.passport import PassportRead
from app.services.passport_builder import aggregate_scores

router = APIRouter(prefix="/passport", tags=["passport"])


@router.post("/{user_id}/rebuild", response_model=PassportRead)
def rebuild_passport(user_id: int, db: Session = Depends(get_db)) -> SkillPassport:
    """Re-aggregate every completed session into the user's passport."""
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    completed = [s for s in user.interview_sessions if s.status == "completed"]
    reports = (
        db.query(FeedbackReport)
        .join(InterviewSession)
        .filter(InterviewSession.user_id == user_id, InterviewSession.status == "completed")
        .all()
    )

    passport = user.passport or SkillPassport(user_id=user_id)
    passport.role = user.target_role
    passport.scores = aggregate_scores(reports)
    passport.sessions_completed = len(completed)

    db.add(passport)
    db.commit()
    db.refresh(passport)
    return passport


@router.get("/{user_id}", response_model=PassportRead)
def get_passport(user_id: int, db: Session = Depends(get_db)) -> SkillPassport:
    passport = db.query(SkillPassport).filter(SkillPassport.user_id == user_id).first()
    if passport is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No passport yet for this user")
    return passport
