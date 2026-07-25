from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(**payload.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, db: Session = Depends(get_db)) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return user
