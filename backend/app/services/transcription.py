"""Speech-to-text for recorded interview answers.

Two providers sit behind one interface. ElevenLabs Scribe covers English and 90+
other languages; Addis AI is trained specifically on Amharic and Afan Oromo, so it
takes over when the session runs in one of those.
"""

import logging

import httpx

from app.core.config import settings

ELEVENLABS_STT_URL = "https://api.elevenlabs.io/v1/speech-to-text"
ADDIS_STT_URL = "https://api.addisassistant.com/api/v2/stt"

ADDIS_LANGUAGES = {"am", "om"}
REQUEST_TIMEOUT = 60.0

logger = logging.getLogger(__name__)


class TranscriptionError(RuntimeError):
    """Raised when a provider cannot turn the audio into text."""


def _has_key(provider: str) -> bool:
    if provider == "addis":
        return bool(settings.ADDIS_AI_API_KEY)
    return bool(settings.ELEVENLABS_API_KEY)


def resolve_provider(language: str) -> str:
    """
    Addis AI owns the Ethiopian languages it was trained on; Scribe takes the rest.

    If the provider that language points at has no key, the other one is used
    instead — both cover English, Amharic, and Afan Oromo, so a half-configured
    deployment still transcribes rather than failing the interview.
    """
    preferred = (
        "addis" if settings.STT_PROVIDER == "addis" or language in ADDIS_LANGUAGES else "elevenlabs"
    )
    if _has_key(preferred):
        return preferred

    alternative = "elevenlabs" if preferred == "addis" else "addis"
    if _has_key(alternative):
        logger.warning(
            "STT provider %r has no API key; falling back to %r for language %r.",
            preferred,
            alternative,
            language,
        )
        return alternative

    return preferred


def transcribe(audio: bytes, filename: str, content_type: str, language: str | None = None) -> str:
    language = language or settings.INTERVIEW_LANGUAGE
    provider = resolve_provider(language)

    if provider == "addis":
        return _transcribe_addis(audio, filename, content_type, language)
    return _transcribe_elevenlabs(audio, filename, content_type, language)


def _transcribe_elevenlabs(audio: bytes, filename: str, content_type: str, language: str) -> str:
    if not settings.ELEVENLABS_API_KEY:
        raise TranscriptionError("ELEVENLABS_API_KEY is not configured.")

    response = httpx.post(
        ELEVENLABS_STT_URL,
        headers={"xi-api-key": settings.ELEVENLABS_API_KEY},
        files={"file": (filename, audio, content_type)},
        data={"model_id": settings.ELEVENLABS_STT_MODEL, "language_code": language},
        timeout=REQUEST_TIMEOUT,
    )
    if response.is_error:
        raise TranscriptionError(f"ElevenLabs transcription failed: {response.text}")

    return response.json().get("text", "").strip()


def _transcribe_addis(audio: bytes, filename: str, content_type: str, language: str) -> str:
    if not settings.ADDIS_AI_API_KEY:
        raise TranscriptionError("ADDIS_AI_API_KEY is not configured.")

    response = httpx.post(
        ADDIS_STT_URL,
        headers={"x-api-key": settings.ADDIS_AI_API_KEY},
        files={"audio": (filename, audio, content_type)},
        # Addis AI expects the config as a stringified JSON field, not real JSON.
        data={"request_data": f'{{"language_code": "{language}"}}'},
        timeout=REQUEST_TIMEOUT,
    )
    if response.is_error:
        raise TranscriptionError(f"Addis AI transcription failed: {response.text}")

    payload = response.json()
    return payload.get("data", {}).get("transcription", "").strip()
