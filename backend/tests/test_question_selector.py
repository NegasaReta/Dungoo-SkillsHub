import json

import pytest

from app.services import question_bank, question_selector


@pytest.fixture
def role():
    return "software-engineer"


def test_bank_exposes_every_role_with_a_label():
    slugs = {entry["slug"] for entry in question_bank.roles()}

    assert {"software-engineer", "data-analyst", "customer-support"} <= slugs
    assert all(entry["label"] for entry in question_bank.roles())


def test_pool_includes_opening_main_and_probes(role):
    pool_ids = {item["id"] for item in question_bank.pool(role)}

    assert question_bank.opening(role)["id"] in pool_ids
    assert {item["id"] for item in question_bank.main_questions(role)} <= pool_ids
    assert {item["id"] for item in question_bank.probes(role)} <= pool_ids


def test_first_turn_is_always_the_role_opening(role):
    chosen = question_selector.select_next(role, history=[], asked_ids=[])

    assert chosen["id"] == question_bank.opening(role)["id"]


def test_turn_cap_is_enforced(monkeypatch):
    monkeypatch.setattr(question_selector.settings, "INTERVIEW_MAX_TURNS", 3)

    assert question_selector.is_final_turn(0) is False
    assert question_selector.is_final_turn(2) is True
    assert question_selector.is_final_turn(9) is True


def test_selection_falls_back_to_an_uncovered_competency(role):
    opening_id = question_bank.opening(role)["id"]
    first_main = question_bank.main_questions(role)[0]

    chosen = question_selector.fallback_choice(role, asked_ids=[opening_id, first_main["id"]])

    assert chosen["competency"] != first_main["competency"]


def test_selection_returns_none_once_the_pool_is_exhausted(role):
    every_id = [item["id"] for item in question_bank.pool(role)]

    assert question_selector.select_next(role, history=[], asked_ids=every_id) is None


def test_without_an_llm_key_selection_stays_deterministic(role, monkeypatch):
    monkeypatch.setattr(question_selector.settings, "LLM_API_KEY", "")
    opening_id = question_bank.opening(role)["id"]

    chosen = question_selector.select_next(role, history=[], asked_ids=[opening_id])

    assert chosen == question_selector.fallback_choice(role, asked_ids=[opening_id])


def test_llm_may_only_choose_an_id_that_exists_in_the_bank(role, monkeypatch):
    monkeypatch.setattr(question_selector.settings, "LLM_API_KEY", "test-key")
    monkeypatch.setattr(
        question_selector,
        "_call_llm",
        lambda prompt: json.dumps({"id": "totally-invented", "reason": "nope"}),
    )
    opening_id = question_bank.opening(role)["id"]

    chosen = question_selector.select_next(role, history=[], asked_ids=[opening_id])

    assert chosen == question_selector.fallback_choice(role, asked_ids=[opening_id])


def test_llm_choice_is_honoured_when_it_names_a_real_probe(role, monkeypatch):
    probe = question_bank.probes(role)[0]
    monkeypatch.setattr(question_selector.settings, "LLM_API_KEY", "test-key")
    monkeypatch.setattr(
        question_selector,
        "_call_llm",
        lambda prompt: json.dumps({"id": probe["id"], "reason": "answer was vague"}),
    )
    opening_id = question_bank.opening(role)["id"]

    chosen = question_selector.select_next(role, history=[], asked_ids=[opening_id])

    assert chosen["id"] == probe["id"]


def test_an_already_asked_question_is_never_repeated(role, monkeypatch):
    opening_id = question_bank.opening(role)["id"]
    monkeypatch.setattr(question_selector.settings, "LLM_API_KEY", "test-key")
    monkeypatch.setattr(
        question_selector,
        "_call_llm",
        lambda prompt: json.dumps({"id": opening_id, "reason": "repeat"}),
    )

    chosen = question_selector.select_next(role, history=[], asked_ids=[opening_id])

    assert chosen["id"] != opening_id


def test_a_broken_llm_reply_degrades_to_the_fallback(role, monkeypatch):
    monkeypatch.setattr(question_selector.settings, "LLM_API_KEY", "test-key")
    monkeypatch.setattr(question_selector, "_call_llm", lambda prompt: "not json at all")
    opening_id = question_bank.opening(role)["id"]

    chosen = question_selector.select_next(role, history=[], asked_ids=[opening_id])

    assert chosen == question_selector.fallback_choice(role, asked_ids=[opening_id])


def test_history_is_rendered_for_the_prompt():
    rendered = question_selector.format_history(
        [{"question": "Tell me about a bug.", "transcript": "I fixed it."}]
    )

    assert "Tell me about a bug." in rendered
    assert "I fixed it." in rendered
