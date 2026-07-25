"""Password changes, the language allowlist, and the practise-languages field."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.constants import ETHIOPIAN_LANGUAGES, INTERNATIONAL_LANGUAGES, LANGUAGES
from app.core.security import create_access_token, hash_password, verify_password
from app.db.database import Base, get_db
from app.db.migrate import ensure_columns
from app.db.models import PasswordResetToken, User, utcnow
from app.main import app

PASSWORD = "supersecret123"
NEW_PASSWORD = "N3w!password"


def _bearer(user_id: int) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user_id)}"}


@pytest.fixture
def session_factory():
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
                hashed_password=hash_password(PASSWORD),
                full_name="Abebe Kebede",
            )
        )
        seed.commit()

    yield TestingSession
    app.dependency_overrides.clear()


@pytest.fixture
def client(session_factory):
    return TestClient(app, headers=_bearer(1))


def _stored_hash(session_factory) -> str:
    with session_factory() as db:
        return db.get(User, 1).hashed_password


# --- change password -----------------------------------------------------------


def test_the_right_current_password_changes_the_password(client, session_factory):
    response = client.post(
        "/auth/change-password",
        json={"current_password": PASSWORD, "new_password": NEW_PASSWORD},
    )

    assert response.status_code == 200
    assert verify_password(NEW_PASSWORD, _stored_hash(session_factory))


def test_the_old_password_stops_working_afterwards(client):
    client.post(
        "/auth/change-password",
        json={"current_password": PASSWORD, "new_password": NEW_PASSWORD},
    )

    old = client.post("/auth/login", json={"email": "candidate@example.com", "password": PASSWORD})
    new = client.post(
        "/auth/login", json={"email": "candidate@example.com", "password": NEW_PASSWORD}
    )

    assert old.status_code == 401
    assert new.status_code == 200


def test_a_wrong_current_password_is_refused(client, session_factory):
    response = client.post(
        "/auth/change-password",
        json={"current_password": "not-my-password", "new_password": NEW_PASSWORD},
    )

    assert response.status_code == 400
    assert verify_password(PASSWORD, _stored_hash(session_factory)), "password must be untouched"


def test_reusing_the_current_password_is_refused(client):
    response = client.post(
        "/auth/change-password",
        json={"current_password": PASSWORD, "new_password": PASSWORD},
    )

    assert response.status_code == 400


def test_a_short_new_password_is_refused(client):
    response = client.post(
        "/auth/change-password",
        json={"current_password": PASSWORD, "new_password": "short"},
    )

    assert response.status_code == 422


def test_changing_the_password_needs_a_token(session_factory):
    anonymous = TestClient(app)

    response = anonymous.post(
        "/auth/change-password",
        json={"current_password": PASSWORD, "new_password": NEW_PASSWORD},
    )

    # 403 rather than 401: the shared bearer dependency answers that way when the
    # Authorization header is missing altogether.
    assert response.status_code == 403


def test_a_password_change_retires_a_pending_reset_link(client, session_factory):
    """A reset link already in flight must not survive a deliberate change."""
    with session_factory() as db:
        db.add(
            PasswordResetToken(
                user_id=1,
                token_hash="a" * 64,
                expires_at=utcnow(),
            )
        )
        db.commit()

    client.post(
        "/auth/change-password",
        json={"current_password": PASSWORD, "new_password": NEW_PASSWORD},
    )

    with session_factory() as db:
        assert db.query(PasswordResetToken).count() == 0


# --- language allowlist --------------------------------------------------------


def test_ten_ethiopian_and_ten_international_languages_are_offered():
    assert len(ETHIOPIAN_LANGUAGES) == 10
    assert len(INTERNATIONAL_LANGUAGES) == 10


def test_the_original_language_slugs_still_validate():
    """Profiles saved before the list grew must stay valid."""
    for slug in ("amharic", "english", "afaan_oromo", "tigrinya", "somali", "other"):
        assert slug in LANGUAGES


def test_no_language_is_listed_twice():
    assert len(LANGUAGES) == len(set(LANGUAGES))


def test_the_options_endpoint_serves_the_whole_list(client):
    response = client.get("/meta/options")

    assert response.json()["languages"] == LANGUAGES


# --- practising languages ------------------------------------------------------


def _profile(**overrides) -> dict:
    payload = {
        "education_level": "bachelor",
        "industries": ["tech"],
        "phone_number": "0912345678",
        "languages": ["amharic"],
    }
    payload.update(overrides)
    return payload


def test_practise_languages_are_saved_and_returned(client):
    response = client.post(
        "/profile/complete", json=_profile(practising_languages=["english", "sidamo"])
    )

    assert response.status_code == 200
    assert response.json()["practising_languages"] == ["english", "sidamo"]
    assert client.get("/auth/me").json()["practising_languages"] == ["english", "sidamo"]


def test_a_profile_without_practise_languages_is_still_accepted(client):
    """Onboarding and older clients never send the field."""
    response = client.post("/profile/complete", json=_profile())

    assert response.status_code == 200
    assert response.json()["practising_languages"] == []


def test_a_language_outside_the_allowlist_is_refused(client):
    response = client.post("/profile/complete", json=_profile(practising_languages=["klingon"]))

    assert response.status_code == 422
    assert "klingon" in response.text


def test_one_of_the_newly_added_languages_is_accepted(client):
    response = client.post("/profile/complete", json=_profile(languages=["wolaytta", "mandarin"]))

    assert response.status_code == 200
    assert response.json()["languages"] == ["wolaytta", "mandarin"]


# --- additive column catch-up --------------------------------------------------


def test_the_column_is_added_to_a_database_that_predates_it():
    """Stands in for a dungoo.db created before the field existed."""
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT)"))
        connection.execute(text("INSERT INTO users (id, email) VALUES (1, 'old@example.com')"))

    assert ensure_columns(engine) == ["users.practising_languages"]

    columns = {column["name"] for column in inspect(engine).get_columns("users")}
    assert "practising_languages" in columns

    with engine.connect() as connection:
        stored = connection.execute(text("SELECT practising_languages FROM users")).scalar()
    assert stored == "[]", "existing rows need a usable value, not NULL"


def test_running_the_catch_up_twice_changes_nothing():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)

    assert ensure_columns(engine) == []
    assert ensure_columns(engine) == []
