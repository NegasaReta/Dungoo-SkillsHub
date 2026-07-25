import json

import pytest

from app.services import lead_ins, question_bank

ROLE = "software-engineer"
QUESTION = "Tell me about a bug you found that others had missed. How did you track it down?"
ROLES = [role["slug"] for role in question_bank.roles()]


@pytest.fixture
def generating(monkeypatch):
    """Turn generation on with a key present, without reaching the network."""
    monkeypatch.setattr(lead_ins.settings, "LLM_API_KEY", "test-key")
    monkeypatch.setattr(lead_ins.settings, "INTERVIEW_GENERATE_LEAD_INS", True)


def _replies(monkeypatch, lines: dict[str, str]):
    monkeypatch.setattr(
        lead_ins.llm, "generate_json", lambda prompt, **_: json.dumps({"lead_ins": lines})
    )


# --- the authored bank text ----------------------------------------------------


@pytest.mark.parametrize("role", ROLES)
def test_every_question_has_an_authored_lead_in(role):
    """It is the fallback for every failure path, so a gap would be silence."""
    assert all(lead_ins.authored(role).values())


@pytest.mark.parametrize("role", ROLES)
def test_authored_lead_ins_pass_the_same_check_as_generated_ones(role):
    for item in question_bank.pool(role):
        assert lead_ins.is_usable(item["lead_in"], item["text"]), item["id"]


# --- what a generated line has to clear ----------------------------------------


def test_a_plain_framing_sentence_is_usable():
    assert lead_ins.is_usable("Most of this job is reading code you did not write.", QUESTION)


def test_a_line_that_asks_something_is_rejected():
    """The bank question follows immediately; two questions at once would collide."""
    assert not lead_ins.is_usable("Have you ever chased down something tricky?", QUESTION)


@pytest.mark.parametrize(
    "line",
    [
        "Give me a concrete example with a measurable result.",
        "Structure this one as situation, task, action and result.",
        "Be specific and quantify the outcome for me.",
        "I am scoring this on clarity and confidence.",
    ],
)
def test_a_line_that_coaches_the_answer_is_rejected(line):
    """Coaching the shape of an answer would make the STAR score meaningless."""
    assert not lead_ins.is_usable(line, QUESTION)


def test_a_line_that_just_restates_the_question_is_rejected():
    assert not lead_ins.is_usable("I want to hear about a tricky bug others missed.", QUESTION)


def test_an_overlong_line_is_rejected():
    assert not lead_ins.is_usable(" ".join(["word"] * (lead_ins.MAX_WORDS + 1)), QUESTION)


def test_an_empty_line_is_rejected():
    assert not lead_ins.is_usable("   ", QUESTION)


def test_ordinary_words_are_not_caught_by_the_rubric_ban():
    """`star` must not match `start`, and `action` must not match `satisfaction`."""
    assert lead_ins.is_usable("To start, customer satisfaction is what this team lives on.", QUESTION)


# --- assembling a session ------------------------------------------------------


def test_without_a_key_the_authored_text_is_used(monkeypatch):
    monkeypatch.setattr(lead_ins.settings, "LLM_API_KEY", "")

    assert lead_ins.for_session(ROLE) == lead_ins.authored(ROLE)


def test_the_flag_turns_generation_off(monkeypatch, generating):
    monkeypatch.setattr(lead_ins.settings, "INTERVIEW_GENERATE_LEAD_INS", False)
    _replies(monkeypatch, {"swe-1": "A generated line that would otherwise be used."})

    assert lead_ins.for_session(ROLE) == lead_ins.authored(ROLE)


def test_a_usable_generated_line_replaces_the_authored_one(monkeypatch, generating):
    _replies(monkeypatch, {"swe-1": "You will be reading other people's code all day here."})

    assert lead_ins.for_session(ROLE)["swe-1"] == (
        "You will be reading other people's code all day here."
    )


def test_one_bad_line_falls_back_without_touching_the_others(monkeypatch, generating):
    _replies(
        monkeypatch,
        {
            "swe-1": "Tell me the situation, the action you took and the result.",
            "swe-2": "Teams argue about technical calls every week.",
        },
    )

    result = lead_ins.for_session(ROLE)

    assert result["swe-1"] == lead_ins.authored(ROLE)["swe-1"]
    assert result["swe-2"] == "Teams argue about technical calls every week."


def test_ids_the_model_skipped_keep_their_authored_line(monkeypatch, generating):
    _replies(monkeypatch, {"swe-1": "You will be reading other people's code all day here."})

    result = lead_ins.for_session(ROLE)

    assert result.keys() == lead_ins.authored(ROLE).keys()
    assert result["swe-3"] == lead_ins.authored(ROLE)["swe-3"]


def test_an_invented_id_is_ignored(monkeypatch, generating):
    _replies(monkeypatch, {"swe-99": "A question that does not exist in the bank."})

    assert lead_ins.for_session(ROLE) == lead_ins.authored(ROLE)


def test_a_model_failure_never_reaches_the_caller(monkeypatch, generating):
    def unreachable(prompt, **_):
        raise lead_ins.llm.LLMError("Gemini request failed: connection refused")

    monkeypatch.setattr(lead_ins.llm, "generate_json", unreachable)

    assert lead_ins.for_session(ROLE) == lead_ins.authored(ROLE)


def test_a_non_json_reply_never_reaches_the_caller(monkeypatch, generating):
    monkeypatch.setattr(
        lead_ins.llm, "generate_json", lambda prompt, **_: "Sure! Here you go..."
    )

    assert lead_ins.for_session(ROLE) == lead_ins.authored(ROLE)


# --- the prompt ----------------------------------------------------------------


def test_prompt_carries_every_question_with_its_competency():
    prompt = lead_ins.build_prompt(ROLE)

    for item in lead_ins.questions_to_frame(ROLE):
        assert item["id"] in prompt
        assert item["text"] in prompt
        assert item["competency"] in prompt


def test_the_greeting_is_never_generated(monkeypatch, generating):
    """A model asked for framing writes a maxim where the opening hello belongs."""
    opening_id = question_bank.opening(ROLE)["id"]
    _replies(monkeypatch, {opening_id: "Every engineering path starts from different ground."})

    assert opening_id not in lead_ins.build_prompt(ROLE)
    assert lead_ins.for_session(ROLE)[opening_id] == lead_ins.authored(ROLE)[opening_id]


def test_prompt_withholds_the_authored_lead_ins():
    """Shown its own fallback the model returns it verbatim, and the call buys nothing."""
    prompt = lead_ins.build_prompt(ROLE)

    assert all(item["lead_in"] not in prompt for item in question_bank.pool(ROLE))


def test_prompt_forbids_coaching_and_questions():
    prompt = lead_ins.build_prompt(ROLE)

    assert "no question mark" in prompt
    assert "how to answer" in prompt


def test_prompt_sends_no_personal_details(monkeypatch):
    from app.db.models import User

    user = User(
        email="abebe@example.com",
        hashed_password="x",
        full_name="Abebe Kebede",
        phone_number="+251912345678",
        industries=["tech"],
        education_level="bachelor",
    )

    prompt = lead_ins.build_prompt(ROLE, user)

    assert "tech" in prompt
    assert "Abebe" not in prompt
    assert "251912345678" not in prompt
    assert "abebe@example.com" not in prompt
