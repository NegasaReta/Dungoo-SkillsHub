"""Gemini-backed English coaching for a single practice message (text mode).

Voice mode never reaches this module: the ElevenLabs agent owns its own prompt and
speech handling, so the only prompt kept here is the JSON-mode coaching one below.
"""

import json
import re
from functools import lru_cache

from google import genai
from google.genai import types

from app.core.config import settings

SYSTEM_PROMPT = """You are an English communication coach. Analyze the user's message for grammar,
vocabulary, and tone errors. Respond with ONLY valid JSON in this exact shape,
no markdown fences, no extra text:
{ "corrected_text": string, "errors": [{ "original": string, "fix": string,
"explanation": string }], "follow_up": string }
If there are no errors, return an empty errors array and still provide a natural
follow_up question."""

FENCE_PATTERN = re.compile(r"^\s*```(?:json)?\s*|\s*```\s*$")

# Gemini reports assistant turns as "model"; the frontend sends OpenAI-style "assistant".
MODEL_ROLES = {"assistant", "model", "ai", "coach"}


class CoachError(RuntimeError):
    """Gemini returned something unusable, twice."""


def is_configured() -> bool:
    return bool(settings.GEMINI_API_KEY)


def build_contents(message: str, history: list[dict]) -> list[types.Content]:
    """Turn the request into Gemini turns, oldest first, with the new message last."""
    contents = [
        types.Content(
            role="model" if str(turn.get("role", "")).lower() in MODEL_ROLES else "user",
            parts=[types.Part(text=str(turn.get("content", "")))],
        )
        for turn in history
    ]
    contents.append(types.Content(role="user", parts=[types.Part(text=message)]))
    return contents


def parse_reply(raw: str) -> dict:
    """Validate a raw Gemini reply against the coaching shape.

    Raises ValueError (which covers JSONDecodeError) on anything malformed so the
    caller can retry once.
    """
    payload = json.loads(FENCE_PATTERN.sub("", raw or ""))
    if not isinstance(payload, dict):
        raise ValueError("Expected a JSON object")
    if not isinstance(payload.get("corrected_text"), str):
        raise ValueError("Missing corrected_text")
    if not isinstance(payload.get("follow_up"), str):
        raise ValueError("Missing follow_up")

    errors = payload.get("errors", [])
    if not isinstance(errors, list):
        raise ValueError("errors must be a list")

    return {
        "corrected_text": payload["corrected_text"],
        "follow_up": payload["follow_up"],
        "errors": [
            {
                "original": str(item.get("original", "")),
                "fix": str(item.get("fix", "")),
                "explanation": str(item.get("explanation", "")),
            }
            for item in errors
            if isinstance(item, dict)
        ],
    }


def coach_message(message: str, history: list[dict]) -> dict:
    """Coach one message, retrying once if the first reply will not parse."""
    contents = build_contents(message, history)

    last_error: Exception | None = None
    for _ in range(2):
        raw = _call_gemini(contents)
        try:
            return parse_reply(raw)
        except ValueError as err:
            last_error = err

    raise CoachError(f"Gemini did not return valid JSON: {last_error}")


@lru_cache(maxsize=1)
def _client(api_key: str) -> genai.Client:
    """Cached so the client outlives the call; a garbage-collected one closes its transport."""
    return genai.Client(api_key=api_key)


def _call_gemini(contents: list[types.Content]) -> str:
    response = _client(settings.GEMINI_API_KEY).models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            temperature=0.4,
            max_output_tokens=2048,
            # Left to itself this model spends the whole output budget thinking and
            # returns an empty candidate.
            thinking_config=types.ThinkingConfig(thinking_level="low"),
        ),
    )
    return response.text or ""
