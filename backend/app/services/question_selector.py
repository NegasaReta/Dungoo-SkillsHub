"""Adaptive question selection over a fixed bank.

The LLM decides *which* question comes next, never what it says. It receives the
conversation so far plus the remaining candidates and returns one id. An id that
is not in the bank is discarded in favour of the deterministic fallback, so a bad
model reply can never put invented words in the interviewer's mouth.
"""

import json

from app.core.config import settings
from app.services import llm, question_bank

SELECTION_PROMPT = """You are running a practice job interview for a {role}.

Conversation so far:
{history}

Choose the single best next question from this list. Prefer a probe when the last
answer was vague, missing a concrete result, or did not describe the candidate's own
actions. Otherwise choose a question covering a competency not yet explored.

Candidates:
{candidates}

Reply with JSON only: {{"id": "<one id from the list>", "reason": "<short reason>"}}
"""


def max_turns() -> int:
    return max(1, settings.INTERVIEW_MAX_TURNS)


def is_final_turn(turn_index: int) -> bool:
    """Turns are zero-based; the cap is fixed so the interview cannot run unbounded."""
    return turn_index >= max_turns() - 1


def format_history(history: list[dict]) -> str:
    if not history:
        return "(nothing yet)"
    return "\n".join(f"Q: {turn['question']}\nA: {turn['transcript']}" for turn in history)


def candidates(role: str, asked_ids: list[str]) -> list[dict]:
    return [item for item in question_bank.pool(role) if item["id"] not in asked_ids]


def fallback_choice(role: str, asked_ids: list[str]) -> dict | None:
    """Next unasked main question, preferring a competency not covered yet."""
    remaining = candidates(role, asked_ids)
    if not remaining:
        return None

    covered = {
        item["competency"]
        for item in question_bank.pool(role)
        if item["id"] in asked_ids
    }
    main_ids = {item["id"] for item in question_bank.main_questions(role)}

    uncovered_main = [
        item for item in remaining if item["id"] in main_ids and item["competency"] not in covered
    ]
    if uncovered_main:
        return uncovered_main[0]

    any_main = [item for item in remaining if item["id"] in main_ids]
    return any_main[0] if any_main else remaining[0]


def select_next(role: str, history: list[dict], asked_ids: list[str]) -> dict | None:
    """Pick the next question. The first turn is always the role's opening."""
    if not asked_ids:
        return question_bank.opening(role)

    remaining = candidates(role, asked_ids)
    if not remaining:
        return None

    if not settings.LLM_API_KEY:
        return fallback_choice(role, asked_ids)

    prompt = SELECTION_PROMPT.format(
        role=role,
        history=format_history(history),
        candidates="\n".join(
            f"- {item['id']} ({item['competency']}): {item['text']}" for item in remaining
        ),
    )

    try:
        chosen_id = parse_choice(_call_llm(prompt))
    except (llm.LLMError, ValueError, KeyError, json.JSONDecodeError):
        # An unreachable or incoherent model costs the interview its adaptivity,
        # never its next question.
        return fallback_choice(role, asked_ids)

    chosen = question_bank.get_question(role, chosen_id)
    # Guard against a hallucinated or already-used id.
    if chosen is None or chosen_id in asked_ids:
        return fallback_choice(role, asked_ids)
    return chosen


def parse_choice(raw: str) -> str:
    return str(json.loads(raw)["id"])


def _call_llm(prompt: str) -> str:
    """Send the selection prompt to the configured provider and return the raw reply."""
    return llm.generate_json(prompt)
