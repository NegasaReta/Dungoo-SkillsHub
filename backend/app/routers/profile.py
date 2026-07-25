from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.user import ProfileCompleteRequest, UserMe

router = APIRouter(prefix="/profile", tags=["profile"])


@router.post("/complete", response_model=UserMe)
def complete_profile(
    payload: ProfileCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    current_user.full_name = payload.full_name
    current_user.education_level = payload.education_level
    current_user.industries = payload.industries
    current_user.phone_number = payload.phone_number
    current_user.languages = payload.languages
    current_user.profile_completed = True

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
