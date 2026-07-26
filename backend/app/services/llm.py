"""Text generation for the prompts that score answers and pick the next question.

Gemini runs both, on the same Google key that speaks the questions in tts.py.
Callers hand over a prompt and parse the reply themselves, so this module never
has to know what a rubric or a question id looks like.
"""

import logging
import time

import httpx

from app.core.config import settings

GENERATE_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
REQUEST_TIMEOUT = 60.0
JSON_MEDIA_TYPE = "application/json"

# Scoring a finished interview sends one request per answer at once, which on the
# free tier is the whole per-minute allowance. Rather than lose those answers'
# feedback, a rate-limited call waits for the window the API names and tries once
# more; the quota resets inside a minute, so a second refusal is a real one.
TOO_MANY_REQUESTS = 429
MAX_ATTEMPTS = 2
FALLBACK_RETRY_SECONDS = 20.0
MAX_RETRY_SECONDS = 45.0

logger = logging.getLogger(__name__)


class LLMError(RuntimeError):
    """Raised when the provider returns no usable text."""


def generate_json(
    prompt: str, timeout: float = REQUEST_TIMEOUT, temperature: float = 0.0
) -> str:
    """Return the model's reply to a prompt that asks for a JSON object.

    Callers `json.loads` the result, so the response mime type is pinned to JSON:
    left to itself the model wraps the object in prose or a code fence.

    Both knobs are per-caller. Scoring keeps the default temperature of 0, so the
    same answer cannot score differently on a re-run; writing the interviewer's
    small talk wants the opposite. And a candidate waiting to join can spare far
    less time than a scoring run nobody is watching.
    """
    if not settings.LLM_API_KEY:
        raise LLMError("LLM_API_KEY is not configured.")

    for attempt in range(1, MAX_ATTEMPTS + 1):
        response = _post(prompt, timeout, temperature)

        if response.status_code == TOO_MANY_REQUESTS and daily_quota_spent(response):
            # No amount of waiting brings this back before midnight.
            raise LLMError(f"Gemini daily quota is spent: {response.text}")

        if response.status_code == TOO_MANY_REQUESTS and attempt < MAX_ATTEMPTS:
            wait = retry_delay(response)
            logger.warning("Gemini rate limit reached; retrying in %.0fs.", wait)
            time.sleep(wait)
            continue

        if response.is_error:
            raise LLMError(f"Gemini text generation failed: {response.text}")

        return extract_text(response.json())

    raise LLMError("Gemini text generation failed: rate limit not cleared.")


def _post(
    prompt: str, timeout: float = REQUEST_TIMEOUT, temperature: float = 0.0
) -> httpx.Response:
    try:
        return httpx.post(
            GENERATE_URL.format(model=settings.LLM_MODEL),
            params={"key": settings.LLM_API_KEY},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "responseMimeType": JSON_MEDIA_TYPE,
                    "temperature": temperature,
                },
            },
            timeout=timeout,
        )
    except httpx.HTTPError as error:
        # Timeouts and DNS failures reach callers as one error type, so a scoring
        # run only has to handle LLMError to survive a bad connection.
        raise LLMError(f"Gemini request failed: {error}") from error


def daily_quota_spent(response: httpx.Response) -> bool:
    """Whether a 429 is the free tier's requests-per-day cap rather than per-minute.

    The API asks for a retry either way, but a daily cap only clears at midnight
    Pacific: sleeping on it would stall a candidate for nothing.
    """
    try:
        details = response.json()["error"]["details"]
        return any(
            "PerDay" in violation.get("quotaId", "")
            for detail in details
            for violation in detail.get("violations", [])
        )
    except (KeyError, TypeError, ValueError, AttributeError):
        return False


def retry_delay(response: httpx.Response) -> float:
    """How long to wait after a 429, taken from the API's own RetryInfo.

    Capped either way: an unparsable or absurd delay must not hold a candidate on
    the wrap-up screen indefinitely.
    """
    try:
        details = response.json()["error"]["details"]
        raw = next(item["retryDelay"] for item in details if "retryDelay" in item)
        seconds = float(str(raw).removesuffix("s"))
    except (KeyError, IndexError, TypeError, ValueError, StopIteration):
        seconds = FALLBACK_RETRY_SECONDS

    # A second of headroom: retrying the instant the window opens can miss it.
    return min(max(seconds, 0.0) + 1.0, MAX_RETRY_SECONDS)


def extract_text(payload: dict) -> str:
    """Pull the reply out of a generateContent response.

    Reasoning models return their scratchpad as extra parts flagged `thought`.
    Those are skipped: concatenating them would corrupt the JSON the caller parses.
    """
    try:
        parts = payload["candidates"][0]["content"]["parts"]
    except (KeyError, IndexError, TypeError) as error:
        raise LLMError(f"Gemini returned no usable candidate: {error}") from error

    text = "".join(part.get("text", "") for part in parts if not part.get("thought")).strip()
    if not text:
        raise LLMError("Gemini returned an empty reply.")

    return strip_code_fence(text)


def strip_code_fence(text: str) -> str:
    """Unwrap ```json ... ``` in case a model ignores the JSON mime type."""
    if not text.startswith("```"):
        return text

    body = text[3:].removesuffix("```").strip()
    first_line, newline, rest = body.partition("\n")
    # The opening fence may carry a language tag; a one-line fence has no tag.
    return (rest.strip() if newline and first_line.strip().isalpha() else body).strip()
