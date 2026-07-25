from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token
from app.db.database import Base, get_db
from app.db.models import User
from app.main import app
from app.services import ai_scoring, passport_builder, question_selector, transcription, tts

ROLE = "software-engineer"


def _report(report_id=1, clarity=4.0, confidence=4.0, star=4.0, strengths=(), improvements=()):
    """A stand-in for a stored FeedbackReport; the builder only reads attributes."""
    return SimpleNamespace(
        id=report_id,
        clarity_score=clarity,
        confidence_score=confidence,
        star_score=star,
        strengths=list(strengths),
        improvements=list(improvements),
    )


def _scores(clarity=4.0, confidence=4.0, star=4.0) -> dict[str, float]:
    return {"clarity": clarity, "confidence": confidence, "star": star}


def _bearer(user_id: int) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user_id)}"}


# --- aggregation ---------------------------------------------------------------


def test_scores_average_across_answers():
    reports = [_report(1, clarity=3.0), _report(2, clarity=4.0)]

    assert passport_builder.aggregate_scores(reports)["clarity"] == 3.5


def test_an_unscored_axis_is_left_out_of_its_own_average():
    """A missing axis must not count as a zero and sink the dimension."""
    reports = [_report(1, confidence=4.0), _report(2, confidence=0.0)]

    assert passport_builder.aggregate_scores(reports)["confidence"] == 4.0


def test_a_dimension_nobody_scored_stays_unscored():
    assert passport_builder.aggregate_scores([_report(1, star=0.0)])["star"] == 0.0


def test_no_answers_means_no_scores():
    assert passport_builder.aggregate_scores([]) == _scores(0.0, 0.0, 0.0)


def test_overall_ignores_unscored_dimensions():
    assert passport_builder.overall_score(_scores(4.0, 5.0, 0.0)) == 4.5


def test_overall_of_an_empty_passport_is_zero():
    assert passport_builder.overall_score(_scores(0.0, 0.0, 0.0)) == 0.0


@pytest.mark.parametrize(
    ("overall", "level"),
    [
        (0.0, "not_scored"),
        (1.0, "emerging"),
        (2.4, "emerging"),
        (2.5, "developing"),
        (3.5, "interview_ready"),
        (4.5, "standout"),
        (5.0, "standout"),
    ],
)
def test_level_bands(overall, level):
    assert passport_builder.level_for(overall) == level


def test_highlights_are_newest_first_and_deduplicated():
    reports = [
        _report(1, strengths=["Clear structure"]),
        _report(2, strengths=["Named a result", "clear structure"]),
    ]

    assert passport_builder.highlights(reports, "strengths") == [
        "Named a result",
        "clear structure",
    ]


def test_highlights_are_capped():
    reports = [_report(1, improvements=["a", "b", "c", "d", "e"])]

    assert len(passport_builder.highlights(reports, "improvements")) == 3


def test_milestones_track_sessions_and_strength():
    achieved = {
        milestone.id: milestone.achieved
        for milestone in passport_builder.milestones(3, _scores(4.0, 4.5, 4.0))
    }

    assert achieved == {
        "first_session": True,
        "three_sessions": True,
        "all_skills_strong": True,
    }


def test_all_skills_strong_needs_every_dimension_scored():
    milestones = passport_builder.milestones(1, _scores(5.0, 5.0, 0.0))

    assert not next(item for item in milestones if item.id == "all_skills_strong").achieved


def test_role_label_comes_from_the_question_bank():
    assert passport_builder.role_label(ROLE) == "Software Engineer"


def test_unknown_role_falls_back_to_a_readable_label():
    assert passport_builder.role_label("tech") == "Tech"


# --- API -----------------------------------------------------------------------


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

    # Keep the interview loop deterministic and offline.
    monkeypatch.setattr(question_selector.settings, "LLM_API_KEY", "")
    monkeypatch.setattr(question_selector.settings, "INTERVIEW_MAX_TURNS", 2)
    monkeypatch.setattr(transcription, "transcribe", lambda *args, **kwargs: "A spoken answer.")
    monkeypatch.setattr(
        tts, "synthesize", lambda text: tts.Speech(b"fake-audio-bytes", tts.MP3_MEDIA_TYPE)
    )

    with TestingSession() as seed:
        seed.add(User(id=1, email="candidate@example.com", hashed_password="x", full_name="Abebe"))
        seed.add(User(id=2, email="intruder@example.com", hashed_password="x"))
        seed.commit()

    yield TestClient(app, headers=_bearer(1))
    app.dependency_overrides.clear()


@pytest.fixture
def scorer(monkeypatch):
    """Stand in for the LLM, and record what it was asked to score."""
    calls = []

    def score_answer(role, question, transcript):
        calls.append({"role": role, "question": question, "transcript": transcript})
        return {
            "clarity": 4.0,
            "confidence": 3.0,
            "star": 5.0,
            "summary": "Solid answer.",
            "strengths": ["Named a result"],
            "improvements": ["Say what you owned"],
        }

    monkeypatch.setattr(ai_scoring, "score_answer", score_answer)
    return calls


def _sit_interview(client, answers=1):
    """Join a session, answer `answers` questions, and leave."""
    session_id = client.post("/interview/sessions", json={"role": ROLE}).json()["id"]
    for _ in range(answers):
        turn = client.post(f"/interview/sessions/{session_id}/turns/next").json()
        client.post(
            f"/interview/sessions/{session_id}/turns/{turn['turn_index']}/answer",
            files={"audio": ("answer.webm", b"binary-audio", "audio/webm")},
        )
    assert client.post(f"/interview/sessions/{session_id}/complete").status_code == 200
    return session_id


def test_passport_requires_a_token():
    assert TestClient(app).get("/passport/me").status_code == 403


def test_a_new_candidate_gets_an_empty_passport_not_a_404(client):
    passport = client.get("/passport/me").json()

    assert passport["sessions_completed"] == 0
    assert passport["level"] == "not_scored"
    assert passport["overall"] == 0
    assert passport["history"] == []


def test_completing_a_session_scores_every_answer(client, scorer):
    _sit_interview(client, answers=2)

    assert len(scorer) == 2
    assert scorer[0]["transcript"] == "A spoken answer."
    assert scorer[0]["role"] == ROLE
    # Only bank text is ever scored, never text the model made up.
    assert scorer[0]["question"]


def test_scores_reach_the_passport(client, scorer):
    _sit_interview(client, answers=2)

    passport = client.get("/passport/me").json()

    assert passport["scores"] == {"clarity": 4.0, "confidence": 3.0, "star": 5.0}
    assert passport["overall"] == 4.0
    assert passport["level"] == "interview_ready"
    assert passport["sessions_completed"] == 1
    assert passport["answers_scored"] == 2


def test_passport_names_its_holder_and_role(client, scorer):
    _sit_interview(client)

    passport = client.get("/passport/me").json()

    assert passport["holder_name"] == "Abebe"
    assert passport["role"] == ROLE
    assert passport["role_label"] == "Software Engineer"


def test_passport_carries_the_scorer_notes(client, scorer):
    _sit_interview(client)

    passport = client.get("/passport/me").json()

    assert passport["strengths"] == ["Named a result"]
    assert passport["focus_areas"] == ["Say what you owned"]


def test_history_has_an_entry_per_session(client, scorer):
    _sit_interview(client)
    _sit_interview(client)

    history = client.get("/passport/me").json()["history"]

    assert [entry["overall"] for entry in history] == [4.0, 4.0]
    assert history[0]["session_id"] < history[1]["session_id"]


def test_completing_twice_does_not_score_the_same_answer_again(client, scorer):
    session_id = _sit_interview(client)

    client.post(f"/interview/sessions/{session_id}/complete")

    assert len(scorer) == 1
    assert client.get("/passport/me").json()["answers_scored"] == 1


def test_a_scoring_failure_still_completes_the_session(client, monkeypatch):
    def unreachable(*args, **kwargs):
        raise RuntimeError("Gemini request failed: connection refused")

    monkeypatch.setattr(ai_scoring, "score_answer", unreachable)

    _sit_interview(client)

    passport = client.get("/passport/me").json()
    assert passport["sessions_completed"] == 1
    assert passport["answers_scored"] == 0
    assert passport["level"] == "not_scored"


def test_an_unscored_answer_is_not_stored_as_a_zero(client, monkeypatch):
    """No API key returns a zeroed result; keeping it would fake a failing score."""
    monkeypatch.setattr(ai_scoring.settings, "LLM_API_KEY", "")

    _sit_interview(client)

    assert client.get("/passport/me").json()["answers_scored"] == 0


def test_history_skips_a_session_that_never_got_scored(client, monkeypatch, scorer):
    _sit_interview(client)
    monkeypatch.setattr(ai_scoring, "score_answer", lambda *args: 1 / 0)
    _sit_interview(client)

    passport = client.get("/passport/me").json()

    assert passport["sessions_completed"] == 2
    assert len(passport["history"]) == 1


def test_one_candidates_scores_never_show_up_in_anothers_passport(client, scorer):
    _sit_interview(client)

    intruder = client.get("/passport/me", headers=_bearer(2)).json()

    assert intruder["sessions_completed"] == 0
    assert intruder["answers_scored"] == 0
    assert intruder["holder_name"] == ""
