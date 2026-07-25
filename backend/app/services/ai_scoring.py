"""LLM scoring of a single interview answer against a fixed rubric."""

import json

from app.core.config import settings

RUBRIC_PROMPT = """You are an interview coach scoring one answer from a candidate
applying for the role of {role}.

Question: {question}
Answer transcript: {transcript}

Score the answer from 0 to 10 on each dimension:
- clarity: structure and ease of following the answer
- confidence: decisiveness and ownership of the work described
- star: how completely the answer covers Situation, Task, Action, Result

Reply with JSON only, using exactly these keys:
{{"clarity": number, "confidence": number, "star": number,
  "summary": string, "strengths": [string], "improvements": [string]}}
"""

SCORE_FIELDS = ("clarity", "confidence", "star")


def build_prompt(role: str, question: str, transcript: str) -> str:
    return RUBRIC_PROMPT.format(role=role, question=question, transcript=transcript)


def parse_scores(raw: str) -> dict:
    """Turn a raw LLM reply into a normalised score dict.

    Scores are clamped to 0-10 so a malformed reply cannot skew the passport.
    """
    payload = json.loads(raw)
    result = {field: min(max(float(payload.get(field, 0)), 0), 10) for field in SCORE_FIELDS}
    result["summary"] = str(payload.get("summary", ""))
    result["strengths"] = [str(item) for item in payload.get("strengths", [])]
    result["improvements"] = [str(item) for item in payload.get("improvements", [])]
    return result


def score_answer(role: str, question: str, transcript: str) -> dict:
    prompt = build_prompt(role, question, transcript)

    if not settings.LLM_API_KEY:
        return {
            "clarity": 0.0,
            "confidence": 0.0,
            "star": 0.0,
            "summary": "Scoring unavailable: LLM_API_KEY is not configured.",
            "strengths": [],
            "improvements": [],
        }

    return parse_scores(_call_llm(prompt))


def _call_llm(prompt: str) -> str:
    """Send the prompt to the configured provider and return the raw reply."""
    raise NotImplementedError("Wire up the LLM provider client here.")
