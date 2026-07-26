import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    generate_reset_token,
    get_current_user,
    hash_password,
    hash_reset_token,
    verify_password,
)
from app.db.database import get_db
from app.db.models import PasswordResetToken, User, utcnow
from app.schemas.user import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    MessageResponse,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
    UserMe,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> TokenResponse:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # The signup form collects a name; the SRS flow does not. Keep it when sent so
    # the profile step does not have to ask again.
    user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        full_name=payload.resolved_full_name,
        industries=[],
        languages=[],
        profile_completed=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(user.id),
        profile_completed=user.profile_completed,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenResponse(
        access_token=create_access_token(user.id),
        profile_completed=user.profile_completed,
    )


@router.get("/me", response_model=UserMe)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail="Your current password is not correct."
        )
    if payload.current_password == payload.new_password:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Your new password must be different from your current one.",
        )

    current_user.hashed_password = hash_password(payload.new_password)

    # Any reset link already in flight would still work against the old grant, so
    # changing the password deliberately retires them.
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == current_user.id,
        PasswordResetToken.used_at.is_(None),
    ).delete()
    db.commit()

    return MessageResponse(message="Your password has been changed.")


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(
    payload: ForgotPasswordRequest, db: Session = Depends(get_db)
) -> ForgotPasswordResponse:
    # The same answer either way: a different response for unknown emails would
    # turn this endpoint into a way to discover who has an account.
    response = ForgotPasswordResponse(
        message="If that email is registered, a password reset link is on its way."
    )

    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user is None:
        return response

    # Requesting a new link retires any earlier one.
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used_at.is_(None),
    ).delete()

    token = generate_reset_token()
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=hash_reset_token(token),
            expires_at=datetime.now(timezone.utc)
            + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES),
        )
    )
    db.commit()

    reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={token}"
    # Stands in for the email that a real deployment would send.
    logger.warning("Password reset link for %s: %s", user.email, reset_url)

    if settings.DEV_EXPOSE_RESET_TOKEN:
        response.reset_token = token
        response.reset_url = reset_url

    return response


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(
    payload: ResetPasswordRequest, db: Session = Depends(get_db)
) -> MessageResponse:
    invalid = HTTPException(
        status.HTTP_400_BAD_REQUEST,
        detail="This reset link is invalid or has expired. Request a new one.",
    )

    record = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == hash_reset_token(payload.token))
        .first()
    )
    if record is None or record.used_at is not None:
        raise invalid

    # SQLite hands back naive datetimes where Postgres is tz-aware.
    expires_at = record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= datetime.now(timezone.utc):
        raise invalid

    user = db.get(User, record.user_id)
    if user is None:
        raise invalid

    user.hashed_password = hash_password(payload.new_password)
    record.used_at = utcnow()
    db.commit()

    return MessageResponse(message="Your password has been reset. You can log in now.")
