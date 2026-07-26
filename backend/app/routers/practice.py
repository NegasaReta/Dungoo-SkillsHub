from fastapi import APIRouter, Depends, HTTPException, status
from google.genai import errors as genai_errors

from app.core.security import get_current_user
from app.db.models import User
from app.schemas.practice import PracticeTextRequest, PracticeTextResponse
from app.services import practice_coach

router = APIRouter(prefix="/practice", tags=["practice"])


@router.post("/text", response_model=PracticeTextResponse)
def practice_text(
    payload: PracticeTextRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Coach one typed message. Voice mode talks to ElevenLabs directly, not here.

    Signed in only. Nothing here is private to the user — the reply depends purely
    on the message sent — but every request spends the project's Gemini quota, and
    an open endpoint on a public URL is a free way for a stranger to exhaust it.
    """
    if not practice_coach.is_configured():
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Coaching unavailable: GEMINI_API_KEY is not configured.",
        )

    try:
        return practice_coach.coach_message(
            payload.message,
            [turn.model_dump() for turn in payload.conversation_history],
        )
    except practice_coach.CoachError as err:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(err)) from err
    except genai_errors.APIError as err:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Gemini request failed: {err}") from err
