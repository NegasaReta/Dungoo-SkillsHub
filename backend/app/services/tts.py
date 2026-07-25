"""
Text-to-speech for interviewer questions.

Two providers sit behind one interface. ElevenLabs returns ready-to-play MP3.
Gemini returns raw PCM samples, which are wrapped in a WAV header here so the
browser can play the response directly, and it runs on the same Google key as the
LLM — so a deployment with no ElevenLabs account still has a voice.

Either provider can cover for the other, both when a key is absent and when a
live request fails.
"""

import base64
import io
import logging
import wave
from typing import NamedTuple

import httpx

from app.core.config import settings

ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
GEMINI_TTS_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)
REQUEST_TIMEOUT = 60.0

MP3_MEDIA_TYPE = "audio/mpeg"
WAV_MEDIA_TYPE = "audio/wav"
# Gemini speech is single-channel 16-bit; the rate is read back off the response.
GEMINI_SAMPLE_WIDTH = 2
GEMINI_FALLBACK_RATE = 24000

logger = logging.getLogger(__name__)


class Speech(NamedTuple):
    audio: bytes
    media_type: str


class SpeechError(RuntimeError):
    """Raised when the provider cannot produce audio."""


def _has_key(provider: str) -> bool:
    if provider == "gemini":
        return bool(settings.LLM_API_KEY)
    return bool(settings.ELEVENLABS_API_KEY)


def resolve_provider() -> str:
    """
    Honour the configured provider, but use the other one if it has no key.

    A missing key would otherwise leave the interviewer silent for a whole
    session, which is the one failure a candidate cannot work around.
    """
    preferred = "gemini" if settings.TTS_PROVIDER == "gemini" else "elevenlabs"
    if _has_key(preferred):
        return preferred

    alternative = "elevenlabs" if preferred == "gemini" else "gemini"
    if _has_key(alternative):
        logger.warning(
            "TTS provider %r has no API key; falling back to %r.", preferred, alternative
        )
        return alternative

    return preferred


def _alternative_to(provider: str) -> str:
    return "elevenlabs" if provider == "gemini" else "gemini"


def _synthesize_with(provider: str, text: str) -> Speech:
    if provider == "gemini":
        return _synthesize_gemini(text)
    return _synthesize_elevenlabs(text)


def synthesize(text: str) -> Speech:
    """
    Return spoken audio for a question, with the media type to serve it as.

    Falls back to the other provider when the first one fails mid-session, not
    just when its key is missing: free-tier quotas run out partway through a
    call, and a silent interviewer is the one failure a candidate cannot work
    around. Only raises once both providers are exhausted.
    """
    primary = resolve_provider()
    try:
        return _synthesize_with(primary, text)
    except SpeechError as error:
        alternative = _alternative_to(primary)
        if not _has_key(alternative):
            raise

        logger.warning(
            "TTS provider %r failed (%s); retrying with %r.", primary, error, alternative
        )
        return _synthesize_with(alternative, text)


def _synthesize_elevenlabs(text: str) -> Speech:
    if not settings.ELEVENLABS_API_KEY:
        raise SpeechError("ELEVENLABS_API_KEY is not configured.")

    response = httpx.post(
        ELEVENLABS_TTS_URL.format(voice_id=settings.ELEVENLABS_VOICE_ID),
        headers={
            "xi-api-key": settings.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
        },
        json={"text": text, "model_id": settings.ELEVENLABS_TTS_MODEL},
        timeout=REQUEST_TIMEOUT,
    )
    if response.is_error:
        raise SpeechError(f"ElevenLabs speech synthesis failed: {response.text}")

    return Speech(response.content, MP3_MEDIA_TYPE)


def _synthesize_gemini(text: str) -> Speech:
    if not settings.LLM_API_KEY:
        raise SpeechError("LLM_API_KEY is not configured; Gemini speech needs it.")

    response = httpx.post(
        GEMINI_TTS_URL.format(model=settings.GEMINI_TTS_MODEL),
        params={"key": settings.LLM_API_KEY},
        json={
            "contents": [{"parts": [{"text": text}]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {
                        "prebuiltVoiceConfig": {"voiceName": settings.GEMINI_TTS_VOICE}
                    }
                },
            },
        },
        timeout=REQUEST_TIMEOUT,
    )
    if response.is_error:
        raise SpeechError(f"Gemini speech synthesis failed: {response.text}")

    try:
        part = response.json()["candidates"][0]["content"]["parts"][0]["inlineData"]
        pcm = base64.b64decode(part["data"])
    except (KeyError, IndexError, TypeError, ValueError) as error:
        raise SpeechError(f"Gemini returned no audio: {error}") from error

    return Speech(_pcm_to_wav(pcm, _sample_rate(part.get("mimeType", ""))), WAV_MEDIA_TYPE)


def _sample_rate(mime_type: str) -> int:
    """Read the rate out of a header like `audio/L16;codec=pcm;rate=24000`."""
    for field in mime_type.split(";"):
        key, _, value = field.strip().partition("=")
        if key == "rate" and value.isdigit():
            return int(value)
    return GEMINI_FALLBACK_RATE


def _pcm_to_wav(pcm: bytes, sample_rate: int) -> bytes:
    """Raw samples cannot be played by an <audio> element; a WAV header can."""
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(GEMINI_SAMPLE_WIDTH)
        handle.setframerate(sample_rate)
        handle.writeframes(pcm)
    return buffer.getvalue()
