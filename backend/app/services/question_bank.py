"""Access to the fixed question bank.

Every question the interviewer can ask lives in data/questions.json. Nothing here
generates text — the adaptive layer only ever picks an id out of this file.
"""

import json
from functools import lru_cache
from pathlib import Path

QUESTIONS_PATH = Path(__file__).resolve().parent.parent / "data" / "questions.json"


@lru_cache
def _bank() -> dict:
    return json.loads(QUESTIONS_PATH.read_text(encoding="utf-8"))


def roles() -> list[dict]:
    return [{"slug": slug, "label": role["label"]} for slug, role in _bank().items()]


def has_role(role: str) -> bool:
    return role in _bank()


def label(role: str) -> str:
    """Human name for a role slug, or the slug itself if the bank has no such role."""
    role_bank = _bank().get(role)
    return role_bank["label"] if role_bank else role


def opening(role: str) -> dict:
    return _bank()[role]["opening"]


def main_questions(role: str) -> list[dict]:
    return _bank()[role]["questions"]


def probes(role: str) -> list[dict]:
    return _bank()[role]["probes"]


def pool(role: str) -> list[dict]:
    """Every question available for a role, opening included."""
    role_bank = _bank()[role]
    return [role_bank["opening"], *role_bank["questions"], *role_bank["probes"]]


def get_question(role: str, question_id: str) -> dict | None:
    return next((item for item in pool(role) if item["id"] == question_id), None)
