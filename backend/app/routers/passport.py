from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.passport import PassportRead
from app.services import passport_builder

router = APIRouter(prefix="/passport", tags=["passport"])


@router.get("/me", response_model=PassportRead)
def my_passport(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PassportRead:
    """The signed-in user's credential.

    Scoped to the token rather than a path id: a passport carries a person's name
    and how they are performing, which nobody else is entitled to read (NFR-5).

    A candidate with no scored sessions gets an empty passport instead of a 404,
    so the screen can invite them to their first interview.
    """
    return passport_builder.build_credential(db, current_user)
