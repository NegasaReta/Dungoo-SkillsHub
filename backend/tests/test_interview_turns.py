import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token
from app.db.database import Base, get_db
from app.db.models import User
from app.main import app
from app.services import question_selector, transcription, tts


def _bearer(user_id: int) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user_id)}"}


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

    # Keep the loop deterministic and offline.
    monkeypatch.setattr(question_selector.settings, "LLM_API_KEY", "")
    monkeypatch.setattr(question_selector.settings, "INTERVIEW_MAX_TURNS", 3)
    monkeypatch.setattr(transcription, "transcribe", lambda *args, **kwargs: "A spoken answer.")
    monkeypatch.setattr(
        tts, "synthesize", lambda text: tts.Speech(b"fake-audio-bytes", tts.MP3_MEDIA_TYPE)
    )

    with TestingSession() as seed:
        seed.add(User(id=1, email="candidate@example.com", hashed_password="x"))
        seed.add(User(id=2, email="intruder@example.com", hashed_password="x"))
        seed.commit()

    # Every request is signed in as user 1 unless a test overrides the header.
    yield TestClient(app, headers=_bearer(1))
    app.dependency_overrides.clear()


@pytest.fixture
def session_id(client):
    response = client.post("/interview/sessions", json={"role": "software-engineer"})
    assert response.status_code == 201
    return response.json()["id"]


def test_roles_come_from_the_bank(client):
    slugs = {role["slug"] for role in client.get("/interview/roles").json()}

    assert "software-engineer" in slugs


def test_session_belongs_to_the_token_holder(client):
    session = client.post("/interview/sessions", json={"role": "software-engineer"}).json()

    assert session["user_id"] == 1


def test_first_turn_is_the_opening_question(client, session_id):
    turn = client.post(f"/interview/sessions/{session_id}/turns/next").json()

    assert turn["turn_index"] == 0
    assert turn["question_id"] == "swe-open"
    assert turn["is_final"] is False
    assert turn["max_turns"] == 3


def test_turns_never_exceed_the_cap(client, session_id):
    for _ in range(3):
        assert client.post(f"/interview/sessions/{session_id}/turns/next").status_code == 201

    overflow = client.post(f"/interview/sessions/{session_id}/turns/next")

    assert overflow.status_code == 409


def test_last_allowed_turn_is_flagged_final(client, session_id):
    turns = [
        client.post(f"/interview/sessions/{session_id}/turns/next").json() for _ in range(3)
    ]

    assert [turn["is_final"] for turn in turns] == [False, False, True]


def test_a_question_is_never_repeated(client, session_id):
    ids = [
        client.post(f"/interview/sessions/{session_id}/turns/next").json()["question_id"]
        for _ in range(3)
    ]

    assert len(set(ids)) == 3


def test_answer_is_transcribed_and_attached_to_its_turn(client, session_id):
    turn = client.post(f"/interview/sessions/{session_id}/turns/next").json()

    response = client.post(
        f"/interview/sessions/{session_id}/turns/{turn['turn_index']}/answer",
        files={"audio": ("answer.webm", b"binary-audio", "audio/webm")},
    )

    assert response.status_code == 200
    assert response.json()["transcript"] == "A spoken answer."


def test_empty_recording_is_rejected(client, session_id):
    client.post(f"/interview/sessions/{session_id}/turns/next")

    response = client.post(
        f"/interview/sessions/{session_id}/turns/0/answer",
        files={"audio": ("answer.webm", b"", "audio/webm")},
    )

    assert response.status_code == 400


def test_question_audio_is_served_as_mp3(client, session_id):
    client.post(f"/interview/sessions/{session_id}/turns/next")

    response = client.get(f"/interview/sessions/{session_id}/turns/0/audio")

    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/mpeg"


def test_unknown_turn_is_a_404(client, session_id):
    assert client.get(f"/interview/sessions/{session_id}/turns/7/audio").status_code == 404


def test_session_requires_a_known_role(client):
    response = client.post("/interview/sessions", json={"role": "astronaut"})

    assert response.status_code == 404


def test_turns_require_a_token(client, session_id):
    # A fresh client so there is no Authorization header at all to override.
    anonymous = TestClient(app)

    response = anonymous.post(f"/interview/sessions/{session_id}/turns/next")

    assert response.status_code == 401


def test_voice_failure_never_leaks_config_details(client, session_id, monkeypatch):
    client.post(f"/interview/sessions/{session_id}/turns/next")

    def unconfigured(text):
        raise tts.SpeechError("ELEVENLABS_API_KEY is not configured.")

    monkeypatch.setattr(tts, "synthesize", unconfigured)

    response = client.get(f"/interview/sessions/{session_id}/turns/0/audio")

    assert response.status_code == 503
    assert "ELEVENLABS" not in response.text
    assert "API_KEY" not in response.text


def test_transcription_failure_never_leaks_config_details(client, session_id, monkeypatch):
    turn = client.post(f"/interview/sessions/{session_id}/turns/next").json()

    def unconfigured(*args, **kwargs):
        raise transcription.TranscriptionError("ADDIS_AI_API_KEY is not configured.")

    monkeypatch.setattr(transcription, "transcribe", unconfigured)

    response = client.post(
        f"/interview/sessions/{session_id}/turns/{turn['turn_index']}/answer",
        files={"audio": ("answer.webm", b"binary-audio", "audio/webm")},
    )

    assert response.status_code == 503
    assert "ADDIS" not in response.text
    assert "API_KEY" not in response.text


def test_completing_without_a_body_still_ends_the_session(client, session_id):
    # The engagement summary is optional all the way down: a client that sends no
    # body at all, because the camera was off or tracking failed, must still be
    # able to end its interview.
    response = client.post(f"/interview/sessions/{session_id}/complete")

    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    assert response.json()["engagement_notes"] == []


def test_engagement_comes_back_as_observations_not_a_score(client, session_id):
    response = client.post(
        f"/interview/sessions/{session_id}/complete",
        json={
            "engagement": {
                "eye_contact": 0.82,
                "head_stability": 0.79,
                "expression_variety": 0.55,
                "samples": 400,
                "duration_seconds": 50.0,
            }
        },
    )

    assert response.status_code == 200
    notes = response.json()["engagement_notes"]
    assert notes and all(isinstance(note, str) for note in notes)
    # Clarity, confidence, and STAR come from the transcript alone; nothing visual
    # may ever surface as a number.
    assert not any(character.isdigit() for note in notes for character in note)


def test_thin_engagement_data_says_so_rather_than_guessing(client, session_id):
    response = client.post(
        f"/interview/sessions/{session_id}/complete",
        json={
            "engagement": {
                "eye_contact": 1.0,
                "head_stability": 1.0,
                "expression_variety": 1.0,
                "samples": 3,
                "duration_seconds": 0.4,
            }
        },
    )

    assert response.json()["engagement_notes"] == [
        "There was not enough video from this session to comment on your presence."
    ]


def test_engagement_ratios_outside_zero_to_one_are_rejected(client, session_id):
    response = client.post(
        f"/interview/sessions/{session_id}/complete",
        json={"engagement": {"eye_contact": 1.4, "samples": 100}},
    )

    assert response.status_code == 422


def test_another_users_session_is_invisible(client, session_id):
    intruder = _bearer(2)

    assert client.post(
        f"/interview/sessions/{session_id}/turns/next", headers=intruder
    ).status_code == 404
    assert client.get(
        f"/interview/sessions/{session_id}/turns/0/audio", headers=intruder
    ).status_code == 404
    assert client.get(
        f"/interview/sessions/{session_id}/feedback", headers=intruder
    ).status_code == 404
