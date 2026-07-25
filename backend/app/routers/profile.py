from fastapi import APIRouter, Depends, HTTPException
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
    # Onboarding omits the name because signup already captured it; the settings
    # page sends it back when it is edited. Either way the account must end up
    # with one.
    name = payload.resolved_full_name
    if name:
        current_user.full_name = name
    elif not current_user.full_name:
        raise HTTPException(
            422,
            detail="A name is required: send full_name, or first_name and last_name.",
        )

    current_user.education_level = payload.education_level
    current_user.industries = payload.industries
    current_user.phone_number = payload.phone_number
    current_user.languages = payload.languages
    current_user.practising_languages = payload.practising_languages
    current_user.profile_completed = True

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
