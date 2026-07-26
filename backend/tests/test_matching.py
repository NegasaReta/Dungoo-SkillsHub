from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token
from app.db.database import Base, get_db
from app.db.models import ExchangeSession, User
from app.main import app
from app.services import exchange, peer_directory

LIMIT = 40 * 60


def _bearer(user_id: int) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user_id)}"}


@pytest.fixture
def db_session():
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

    with TestingSession() as seed:
        seed.add(
            User(
                id=1,
                email="candidate@example.com",
                hashed_password="x",
                full_name="Abebe Kebede",
                languages=["amharic"],
            )
        )
        seed.add(User(id=2, email="intruder@example.com", hashed_password="x", languages=[]))
        seed.commit()

    yield TestingSession
    app.dependency_overrides.clear()


@pytest.fixture
def client(db_session):
    return TestClient(app, headers=_bearer(1))


@pytest.fixture
def user(db_session):
    with db_session() as db:
        yield db.get(User, 1)


def _start(client, peer_id=3, speaks=("amharic",), wants=("english",)):
    return client.post(
        "/matching/sessions",
        json={"peer_id": peer_id, "speaks": list(speaks), "wants": list(wants)},
    )


# --- the pairing rule ----------------------------------------------------------


def test_a_match_needs_a_language_going_at_least_one_way():
    """Nobody speaks Tigrinya and wants Tigrinya back, so nothing should pair."""
    assert peer_directory.rank(speaks=[], wants=[]) == []


def test_mutual_exchanges_outrank_one_way_ones():
    matches = peer_directory.rank(speaks=["amharic"], wants=["english"])

    mutual = [match["mutual"] for match in matches]
    assert mutual == sorted(mutual, reverse=True)
    assert mutual[0] is True


def test_teaches_and_learns_are_narrowed_to_the_viewer():
    # Hanna speaks English and Tigrinya, and is learning Amharic.
    hanna = next(
        match
        for match in peer_directory.rank(speaks=["amharic"], wants=["english"])
        if match["id"] == 3
    )

    assert hanna["teaches"] == ["english"]
    assert hanna["learns"] == ["amharic"]
    assert hanna["mutual"] is True


def test_a_peer_with_nothing_to_trade_is_left_out():
    # Yonas speaks only Amharic and is learning English and Tigrinya. Someone who
    # speaks English and wants Amharic pairs with him; someone wanting Afaan Oromo
    # from an Afaan Oromo speaker has nothing to trade.
    matched = [peer["id"] for peer in peer_directory.rank(speaks=["afaan_oromo"], wants=["afaan_oromo"])]

    assert 4 not in matched


def test_filters_narrow_the_pool():
    # An English speaker wanting Amharic matches Yonas and Dawit, who are offline.
    everyone = peer_directory.rank(speaks=["english"], wants=["amharic"])
    online = peer_directory.rank(speaks=["english"], wants=["amharic"], online_only=True)
    finance = peer_directory.rank(speaks=["amharic"], wants=["english"], industry="finance")

    assert len(online) < len(everyone)
    assert all(peer["online"] for peer in online)
    assert {peer["industry"] for peer in finance} == {"finance"}


def test_the_score_never_claims_a_perfect_match():
    best = max(
        peer_directory.rank(speaks=["amharic", "english"], wants=["english", "afaan_oromo"]),
        key=lambda peer: peer["match_percent"],
    )

    assert best["match_percent"] <= 99


# --- the API surface -----------------------------------------------------------


def test_every_matching_route_needs_a_token():
    anonymous = TestClient(app)

    assert anonymous.get("/matching/peers").status_code == 401
    assert anonymous.get("/matching/allowance").status_code == 401
    assert anonymous.post("/matching/sessions", json={"peer_id": 1}).status_code == 401


def test_options_are_slugs_the_ui_can_translate(client):
    options = client.get("/matching/options").json()

    assert options["languages"] == ["amharic", "afaan_oromo", "tigrinya", "english"]
    assert options["levels"] == ["beginner", "intermediate", "advanced"]
    assert options["daily_limit_seconds"] == LIMIT
    # Only industries somebody in the pool works in, so no filter comes back empty.
    assert options["industries"] == ["education", "engineering", "finance", "health", "tech"]


def test_peers_fall_back_to_the_profile_languages(client):
    """The page must fill itself on first load, before any filter is touched."""
    matches = client.get("/matching/peers").json()

    assert matches
    # The seeded user speaks Amharic, so the default want is English.
    assert all("english" in peer["teaches"] or "amharic" in peer["learns"] for peer in matches)


def test_an_unknown_language_is_rejected_rather_than_ignored(client):
    response = client.get("/matching/peers", params={"speaks": ["klingon"]})

    assert response.status_code == 422
    assert "klingon" in response.json()["detail"]


def test_starting_a_session_records_what_the_pair_practise(client):
    session = _start(client).json()

    assert session["peer_name"] == "Hanna Girma"
    assert session["status"] == "active"
    assert session["teaches"] == ["english"]
    assert session["learns"] == ["amharic"]
    assert set(session["languages"]) == {"english", "amharic"}
    assert session["mutual"] is True


def test_the_server_decides_the_pairing_not_the_client(client, db_session):
    """A client claiming a mutual Tigrinya trade with Hanna must not get one."""
    session = _start(client, peer_id=3, speaks=["tigrinya"], wants=["tigrinya"]).json()

    # Hanna speaks Tigrinya but is learning Amharic, so this is one-way only.
    assert session["teaches"] == ["tigrinya"]
    assert session["learns"] == []
    assert session["mutual"] is False


def test_a_pair_with_no_shared_language_is_refused(client):
    # Meron speaks Afaan Oromo and English, and wants Tigrinya.
    response = _start(client, peer_id=5, speaks=["amharic"], wants=["amharic"])

    assert response.status_code == 409


def test_an_unknown_peer_is_a_404(client):
    assert _start(client, peer_id=999).status_code == 404


# --- the allowance -------------------------------------------------------------


def test_a_fresh_day_has_the_whole_allowance(client):
    assert client.get("/matching/allowance").json() == {
        "date": exchange.local_day(exchange.now()).isoformat(),
        "daily_limit_seconds": LIMIT,
        "used_seconds": 0,
        "remaining_seconds": LIMIT,
        "exhausted": False,
    }


def test_time_is_measured_by_the_server_clock(client, db_session):
    session_id = _start(client).json()["id"]

    # Backdate the clock rather than sleeping: same effect, no waiting.
    with db_session() as db:
        session = db.get(ExchangeSession, session_id)
        session.resumed_at = exchange.now() - timedelta(minutes=5)
        db.commit()

    assert client.get("/matching/allowance").json()["used_seconds"] >= 300


def test_the_client_cannot_report_its_own_duration(client, db_session):
    """There is no field to send one, and ending computes it from the timestamps."""
    session_id = _start(client).json()["id"]

    with db_session() as db:
        session = db.get(ExchangeSession, session_id)
        session.resumed_at = exchange.now() - timedelta(minutes=2)
        db.commit()

    ended = client.post(f"/matching/sessions/{session_id}/end", json={"seconds": 9999}).json()

    assert 118 <= ended["seconds"] <= 125


def test_pausing_stops_the_clock(client, db_session):
    session_id = _start(client).json()["id"]

    with db_session() as db:
        session = db.get(ExchangeSession, session_id)
        session.resumed_at = exchange.now() - timedelta(minutes=3)
        db.commit()

    paused = client.post(f"/matching/sessions/{session_id}/pause").json()
    assert paused["status"] == "paused"

    banked = client.get("/matching/allowance").json()["used_seconds"]
    assert client.get("/matching/allowance").json()["used_seconds"] == banked


def test_resuming_starts_it_again(client):
    session_id = _start(client).json()["id"]
    client.post(f"/matching/sessions/{session_id}/pause")

    resumed = client.post(f"/matching/sessions/{session_id}/resume").json()

    assert resumed["status"] == "active"


def test_a_spent_allowance_refuses_a_new_session(client, db_session):
    session_id = _start(client).json()["id"]
    with db_session() as db:
        session = db.get(ExchangeSession, session_id)
        session.accumulated_seconds = LIMIT
        session.resumed_at = None
        session.status = exchange.COMPLETED
        session.ended_at = exchange.now()
        db.commit()

    response = _start(client)

    assert response.status_code == 429
    assert client.get("/matching/allowance").json()["exhausted"] is True


def test_a_spent_allowance_refuses_a_resume(client, db_session):
    session_id = _start(client).json()["id"]
    client.post(f"/matching/sessions/{session_id}/pause")

    with db_session() as db:
        session = db.get(ExchangeSession, session_id)
        session.accumulated_seconds = LIMIT
        db.commit()

    assert client.post(f"/matching/sessions/{session_id}/resume").status_code == 429


def test_two_sessions_cannot_burn_the_allowance_twice_over(client, db_session):
    """Starting again closes the old session instead of running two clocks."""
    first = _start(client).json()["id"]

    # Sara speaks English, so this is a real second session rather than a refusal.
    assert _start(client, peer_id=1).status_code == 201

    with db_session() as db:
        assert db.get(ExchangeSession, first).status == "completed"
        open_sessions = [
            session
            for session in db.query(ExchangeSession).all()
            if session.status in exchange.OPEN_STATUSES
        ]
        assert len(open_sessions) == 1


def test_usage_never_exceeds_the_daily_limit(client, db_session):
    """An abandoned tab costs the day, not more than the day."""
    session_id = _start(client).json()["id"]

    with db_session() as db:
        session = db.get(ExchangeSession, session_id)
        session.resumed_at = exchange.now() - timedelta(hours=6)
        db.commit()

    allowance = client.get("/matching/allowance").json()
    assert allowance["used_seconds"] == LIMIT
    assert allowance["remaining_seconds"] == 0


def test_yesterdays_session_does_not_spend_todays_allowance(client, db_session):
    session_id = _start(client).json()["id"]

    with db_session() as db:
        session = db.get(ExchangeSession, session_id)
        session.started_at = exchange.now() - timedelta(days=1)
        session.resumed_at = None
        session.accumulated_seconds = LIMIT
        session.status = exchange.COMPLETED
        db.commit()

    assert client.get("/matching/allowance").json()["used_seconds"] == 0


def test_the_day_rolls_over_at_ethiopian_midnight():
    """01:00 UTC is 04:00 in Addis, so it belongs to the day that already started."""
    just_after_utc_midnight = datetime(2026, 7, 26, 1, 0, tzinfo=timezone.utc)

    assert exchange.local_day(just_after_utc_midnight).day == 26
    # 22:00 UTC is already 01:00 the next morning locally.
    assert exchange.local_day(datetime(2026, 7, 26, 22, 0, tzinfo=timezone.utc)).day == 27


# --- state and history ---------------------------------------------------------


def test_state_restores_a_session_after_a_reload(client):
    session_id = _start(client).json()["id"]

    state = client.get("/matching/state").json()

    assert state["session"]["id"] == session_id
    assert state["allowance"]["exhausted"] is False


def test_state_is_empty_when_nothing_is_running(client):
    assert client.get("/matching/state").json()["session"] is None


def test_history_keeps_real_practice(client, db_session):
    session_id = _start(client).json()["id"]
    with db_session() as db:
        session = db.get(ExchangeSession, session_id)
        session.resumed_at = exchange.now() - timedelta(minutes=4)
        db.commit()
    client.post(f"/matching/sessions/{session_id}/end")

    history = client.get("/matching/sessions").json()

    assert len(history) == 1
    assert history[0]["seconds"] >= 240
    assert history[0]["status"] == "completed"


def test_history_drops_a_misclick(client):
    """A session opened and closed at once is not practice."""
    session_id = _start(client).json()["id"]
    client.post(f"/matching/sessions/{session_id}/end")

    assert client.get("/matching/sessions").json() == []


def test_ending_twice_is_harmless(client, db_session):
    session_id = _start(client).json()["id"]
    with db_session() as db:
        db.get(ExchangeSession, session_id).resumed_at = exchange.now() - timedelta(minutes=2)
        db.commit()

    first = client.post(f"/matching/sessions/{session_id}/end").json()
    second = client.post(f"/matching/sessions/{session_id}/end").json()

    assert first["seconds"] == second["seconds"]


def test_a_finished_session_cannot_be_resumed(client):
    session_id = _start(client).json()["id"]
    client.post(f"/matching/sessions/{session_id}/end")

    assert client.post(f"/matching/sessions/{session_id}/resume").status_code == 409


def test_another_users_session_is_invisible(client):
    session_id = _start(client).json()["id"]
    intruder = _bearer(2)

    assert client.post(f"/matching/sessions/{session_id}/pause", headers=intruder).status_code == 404
    assert client.post(f"/matching/sessions/{session_id}/end", headers=intruder).status_code == 404
    assert client.get("/matching/sessions", headers=intruder).json() == []
