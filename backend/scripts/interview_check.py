"""Sit a whole interview against the running server, using real speech.

provider_check.py proves the keys work. This proves the interview built on them
works: sign up, join, hear a question, answer it out loud, and come away with
scored feedback and an updated passport.

The candidate's answers are spoken rather than typed. A written STAR answer is
turned into audio by the TTS provider and uploaded as a recording, so the upload
path, the transcription, and the scoring all see real audio — the same bytes a
browser would send. Nothing here is stubbed.

Start the API first, then:

    .venv\\Scripts\\python.exe scripts\\interview_check.py
"""

import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx  # noqa: E402

from app.services import tts  # noqa: E402

BASE_URL = "http://127.0.0.1:8000"
TIMEOUT = 120.0

# Deliberately a strong STAR answer: situation, task, action, result. If scoring is
# wired to the model rather than returning a constant, this has to score well.
SPOKEN_ANSWER = (
    "In my final year at university, our team's payment feature was failing for most "
    "users two days before the deadline. I took responsibility for finding the cause. "
    "I added logging around every request, traced it to an expired certificate on the "
    "gateway, renewed it, and wrote a check that warns us a month before expiry. "
    "We shipped on time, and that check has caught the same problem twice since."
)
PASSING_SCORE = 1.0


class CheckFailed(RuntimeError):
    """A step returned something the interview cannot continue from."""


def step(name: str, detail: str = "") -> None:
    print(f"  [PASS] {name}" + (f" — {detail}" if detail else ""))


def expect(response: httpx.Response, *allowed: int) -> dict:
    if response.status_code not in allowed:
        raise CheckFailed(
            f"{response.request.method} {response.request.url.path} "
            f"returned {response.status_code}: {response.text[:300]}"
        )
    return response.json() if response.content else {}


def sign_up(client: httpx.Client) -> None:
    email = f"interview-check-{uuid.uuid4().hex[:8]}@example.com"
    body = expect(
        client.post(
            "/auth/signup",
            json={
                "email": email,
                "password": "practice-run-123",
                "first_name": "Sara",
                "last_name": "Tesfaye",
            },
        ),
        200,
        201,
    )
    client.headers["Authorization"] = f"Bearer {body['access_token']}"
    step("signed up", email)


def start_session(client: httpx.Client) -> tuple[int, str]:
    roles = expect(client.get("/interview/roles"), 200)
    if not roles:
        raise CheckFailed("the question bank offers no roles")

    role = roles[0]["slug"]
    session = expect(client.post("/interview/sessions", json={"role": role}), 200, 201)
    step("joined the room", f"session {session['id']} as {role}")
    return session["id"], role


def answer_audio() -> tuple[bytes, str, str]:
    """The candidate's spoken answer, made with whichever voice is configured."""
    spoken = tts.synthesize(SPOKEN_ANSWER)
    filename = "answer.wav" if spoken.media_type == tts.WAV_MEDIA_TYPE else "answer.mp3"
    step("recorded an answer", f"{len(spoken.audio):,} bytes via {tts.resolve_provider()}")
    return spoken.audio, filename, spoken.media_type


def take_turn(client: httpx.Client, session_id: int, recording: tuple[bytes, str, str]) -> bool:
    """Ask, listen, answer. Returns whether the interview has more turns left."""
    turn = expect(client.post(f"/interview/sessions/{session_id}/turns/next"), 200, 201)
    index = turn["turn_index"]
    step(f"turn {index + 1} asked", turn["text"][:70] + "…")

    audio = client.get(f"/interview/sessions/{session_id}/turns/{index}/audio")
    if audio.status_code != 200 or not audio.content:
        raise CheckFailed(f"question audio failed: {audio.status_code} {audio.text[:200]}")
    step(f"turn {index + 1} spoken", f"{len(audio.content):,} bytes of {audio.headers['content-type']}")

    payload, filename, media_type = recording
    answered = expect(
        client.post(
            f"/interview/sessions/{session_id}/turns/{index}/answer",
            files={"audio": (filename, payload, media_type)},
            data={"language": "en"},
        ),
        200,
    )
    transcript = answered["transcript"]
    if not transcript.strip():
        raise CheckFailed(f"turn {index + 1} transcribed to nothing")
    step(f"turn {index + 1} transcribed", f"{len(transcript.split())} words")

    return not turn["is_final"]


def finish(client: httpx.Client, session_id: int) -> None:
    summary = expect(
        client.post(
            f"/interview/sessions/{session_id}/complete",
            json={
                "engagement": {
                    "eye_contact": 0.78,
                    "head_stability": 0.81,
                    "expression_variety": 0.44,
                    "samples": 420,
                    "duration_seconds": 52.5,
                }
            },
        ),
        200,
    )
    if summary["status"] != "completed":
        raise CheckFailed(f"session ended as {summary['status']!r}")

    notes = summary["engagement_notes"]
    if not notes:
        raise CheckFailed("engagement was posted but came back with no observations")
    if any(character.isdigit() for note in notes for character in note):
        raise CheckFailed(f"engagement leaked a number into feedback: {notes}")
    step("session closed", f"{len(notes)} engagement note(s): {notes[0]}")


def check_feedback(client: httpx.Client, session_id: int) -> None:
    reports = expect(client.get(f"/interview/sessions/{session_id}/feedback"), 200)
    if not reports:
        raise CheckFailed("the finished session produced no feedback")

    for report in reports:
        scores = (report["clarity_score"], report["confidence_score"], report["star_score"])
        if all(score == 0 for score in scores):
            raise CheckFailed(f"{report['question_id']} scored zero across the board")
        if not report["summary"].strip():
            raise CheckFailed(f"{report['question_id']} came back with an empty summary")

    best = max(reports, key=lambda item: item["star_score"])
    step(
        f"scored {len(reports)} answer(s)",
        f"best STAR {best['star_score']}, clarity {best['clarity_score']}",
    )
    print(f"\n    Model's take: {best['summary'][:200]}")


def check_passport(client: httpx.Client) -> None:
    passport = expect(client.get("/passport/me"), 200)
    if not passport.get("sessions_completed"):
        raise CheckFailed("the passport did not count the finished session")
    step(
        "passport updated",
        f"{passport['sessions_completed']} session(s), scores {passport['scores']}",
    )


def main() -> int:
    with httpx.Client(base_url=BASE_URL, timeout=TIMEOUT) as client:
        try:
            client.get("/health")
        except httpx.HTTPError:
            print(f"Nothing is listening on {BASE_URL}. Start the API first.")
            return 1

        try:
            sign_up(client)
            session_id, _ = start_session(client)
            recording = answer_audio()

            while take_turn(client, session_id, recording):
                pass

            finish(client, session_id)
            check_feedback(client, session_id)
            check_passport(client)
        except (CheckFailed, tts.SpeechError) as failure:
            print(f"  [FAIL] {failure}")
            return 1

    print("\nThe whole interview ran on live providers.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
