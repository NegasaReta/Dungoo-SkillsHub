from fastapi import APIRouter, HTTPException, status
from google.genai import errors as genai_errors

from app.schemas.practice import PracticeTextRequest, PracticeTextResponse
from app.services import practice_coach

router = APIRouter(prefix="/practice", tags=["practice"])


@router.post("/text", response_model=PracticeTextResponse)
def practice_text(payload: PracticeTextRequest) -> dict:
    """Coach one typed message. Voice mode talks to ElevenLabs directly, not here."""
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
