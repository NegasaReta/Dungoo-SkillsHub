import json

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token
from app.db.database import Base, get_db
from app.db.models import User
from app.main import app
from app.services import practice_coach
from app.services.practice_coach import SYSTEM_PROMPT, build_contents, parse_reply


def test_system_prompt_pins_the_json_shape():
    assert '"corrected_text": string' in SYSTEM_PROMPT
    assert '"explanation": string' in SYSTEM_PROMPT
    assert "no markdown fences" in SYSTEM_PROMPT


def test_build_contents_puts_the_new_message_last():
    contents = build_contents("How do I sound?", [{"role": "user", "content": "Hello"}])

    assert len(contents) == 2
    assert contents[-1].role == "user"
    assert contents[-1].parts[0].text == "How do I sound?"


def test_build_contents_maps_assistant_turns_to_model():
    contents = build_contents("Next", [{"role": "assistant", "content": "Earlier reply"}])

    assert contents[0].role == "model"
    assert contents[0].parts[0].text == "Earlier reply"


def test_parse_reply_reads_every_field():
    raw = json.dumps(
        {
            "corrected_text": "I went to the meeting yesterday.",
            "errors": [
                {
                    "original": "have went",
                    "fix": "went",
                    "explanation": "Simple past does not take 'have'.",
                }
            ],
            "follow_up": "What was decided in the meeting?",
        }
    )

    result = parse_reply(raw)

    assert result["corrected_text"] == "I went to the meeting yesterday."
    assert result["errors"][0]["fix"] == "went"
    assert result["follow_up"] == "What was decided in the meeting?"


def test_parse_reply_accepts_an_empty_error_list():
    raw = json.dumps({"corrected_text": "Perfect.", "errors": [], "follow_up": "What next?"})

    assert parse_reply(raw)["errors"] == []


def test_parse_reply_tolerates_markdown_fences():
    raw = '```json\n{"corrected_text": "Fine.", "errors": [], "follow_up": "And then?"}\n```'

    assert parse_reply(raw)["corrected_text"] == "Fine."


def test_parse_reply_fills_missing_error_keys():
    raw = json.dumps(
        {"corrected_text": "Fine.", "errors": [{"original": "a"}], "follow_up": "Why?"}
    )

    assert parse_reply(raw)["errors"][0] == {"original": "a", "fix": "", "explanation": ""}


def test_parse_reply_rejects_non_json():
    with pytest.raises(ValueError):
        parse_reply("Sure! Here is your correction...")


def test_parse_reply_rejects_a_missing_corrected_text():
    with pytest.raises(ValueError):
        parse_reply(json.dumps({"errors": [], "follow_up": "What next?"}))


def test_parse_reply_rejects_an_empty_reply():
    with pytest.raises(ValueError):
        parse_reply("")


# --- the endpoint --------------------------------------------------------------

COACHED = {
    "corrected_text": "I went to the market.",
    "errors": [{"original": "goed", "fix": "went", "explanation": "Irregular past tense."}],
    "follow_up": "What did you buy?",
}


@pytest.fixture
def client(monkeypatch):
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    # Never call Gemini from a test: the key would be spent and the suite would
    # only pass while the network and the quota both held.
    monkeypatch.setattr(practice_coach.settings, "GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(practice_coach, "coach_message", lambda message, history: COACHED)

    with TestingSession() as seed:
        seed.add(User(id=1, email="learner@example.com", hashed_password="x"))
        seed.commit()

    yield TestClient(app, headers={"Authorization": f"Bearer {create_access_token(1)}"})
    app.dependency_overrides.clear()


def _ask(client, message="I goed to the market.", **kwargs):
    return client.post(
        "/practice/text", json={"message": message, "conversation_history": []}, **kwargs
    )


def test_coaching_requires_a_token(client):
    """Every reply spends the project's Gemini quota, so it cannot be open to anyone."""
    anonymous = TestClient(app)

    assert _ask(anonymous).status_code == 401


def test_a_signed_in_learner_gets_their_corrections(client):
    body = _ask(client).json()

    assert body["corrected_text"] == COACHED["corrected_text"]
    assert body["errors"][0]["fix"] == "went"
    assert body["follow_up"] == COACHED["follow_up"]


def test_history_reaches_the_coach(client, monkeypatch):
    seen = {}

    def record(message, history):
        seen.update(message=message, history=history)
        return COACHED

    monkeypatch.setattr(practice_coach, "coach_message", record)
    client.post(
        "/practice/text",
        json={
            "message": "And then?",
            "conversation_history": [{"role": "assistant", "content": "What did you buy?"}],
        },
    )

    assert seen["message"] == "And then?"
    assert seen["history"] == [{"role": "assistant", "content": "What did you buy?"}]


def test_a_missing_key_is_reported_as_unavailable_not_as_a_crash(client, monkeypatch):
    monkeypatch.setattr(practice_coach.settings, "GEMINI_API_KEY", "")

    assert _ask(client).status_code == 503


def test_an_unusable_reply_becomes_a_bad_gateway(client, monkeypatch):
    def unusable(message, history):
        raise practice_coach.CoachError("Gemini did not return valid JSON")

    monkeypatch.setattr(practice_coach, "coach_message", unusable)

    assert _ask(client).status_code == 502
