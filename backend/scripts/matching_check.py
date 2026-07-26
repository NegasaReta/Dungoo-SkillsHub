"""Run a peer exchange against the live server and try to cheat the allowance.

The unit tests run on SQLite, which hands back naive datetimes where Postgres
hands back aware ones. Since the whole allowance is datetime arithmetic, passing
tests do not prove the feature works on Neon — this does.

It also tries the two things a client would do to get more than its free 40
minutes: run two sessions at once, and end a session claiming a duration of its
own choosing. Both should fail.

Start the API first, then:

    .venv\\Scripts\\python.exe scripts\\matching_check.py
"""

import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx  # noqa: E402

BASE_URL = "http://127.0.0.1:8000"
TIMEOUT = 30.0
DAILY_LIMIT = 40 * 60


class CheckFailed(RuntimeError):
    """The server allowed something it should not have, or refused something it should."""


def step(name: str, detail: str = "") -> None:
    print(f"  [PASS] {name}" + (f" — {detail}" if detail else ""))


def expect(response: httpx.Response, *allowed: int) -> dict:
    if response.status_code not in allowed:
        raise CheckFailed(
            f"{response.request.method} {response.request.url.path} "
            f"returned {response.status_code}, wanted {allowed}: {response.text[:300]}"
        )
    return response.json() if response.content else {}


def sign_up(client: httpx.Client) -> None:
    email = f"matching-check-{uuid.uuid4().hex[:8]}@example.com"
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


def check_directory(client: httpx.Client) -> int:
    options = expect(client.get("/matching/options"), 200)
    if options["daily_limit_seconds"] != DAILY_LIMIT:
        raise CheckFailed(f"allowance is {options['daily_limit_seconds']}s, expected {DAILY_LIMIT}")

    matches = expect(client.get("/matching/peers", params={"speaks": "amharic", "wants": "english"}), 200)
    if not matches:
        raise CheckFailed("no partners came back for an Amharic speaker wanting English")

    ranking = [(match["mutual"], match["match_percent"]) for match in matches]
    if ranking != sorted(ranking, reverse=True):
        raise CheckFailed(f"partners came back out of order: {ranking}")

    best = matches[0]
    step(
        f"ranked {len(matches)} partner(s)",
        f"{best['name']} at {best['match_percent']}%, "
        f"teaches {best['teaches']}, learns {best['learns']}",
    )
    return best["id"]


def check_fresh_allowance(client: httpx.Client) -> None:
    allowance = expect(client.get("/matching/allowance"), 200)
    if allowance["used_seconds"] != 0 or allowance["remaining_seconds"] != DAILY_LIMIT:
        raise CheckFailed(f"a new account did not start with a full allowance: {allowance}")
    step("allowance starts full", f"{allowance['remaining_seconds'] // 60} min on {allowance['date']}")


def check_session_clock(client: httpx.Client, peer_id: int) -> int:
    session = expect(
        client.post(
            "/matching/sessions",
            json={"peer_id": peer_id, "speaks": ["amharic"], "wants": ["english"]},
        ),
        201,
    )
    if session["status"] != "active":
        raise CheckFailed(f"session opened as {session['status']!r}")
    step("session started", f"with {session['peer_name']} on {session['languages']}")

    restored = expect(client.get("/matching/state"), 200)
    if not restored["session"] or restored["session"]["id"] != session["id"]:
        raise CheckFailed("a reload would lose the running session")
    step("survives a reload", f"state returned session {session['id']}")

    paused = expect(client.post(f"/matching/sessions/{session['id']}/pause"), 200)
    if paused["status"] != "paused":
        raise CheckFailed(f"pause left the session {paused['status']!r}")

    resumed = expect(client.post(f"/matching/sessions/{session['id']}/resume"), 200)
    if resumed["status"] != "active":
        raise CheckFailed(f"resume left the session {resumed['status']!r}")
    step("pause and resume work", f"{resumed['seconds']}s banked so far")

    return session["id"]


def check_cannot_double_spend(client: httpx.Client, peer_id: int, first_id: int) -> None:
    """Two clocks at once would spend 40 minutes in 20."""
    expect(
        client.post(
            "/matching/sessions",
            json={"peer_id": peer_id, "speaks": ["amharic"], "wants": ["english"]},
        ),
        201,
    )
    state = expect(client.get("/matching/state"), 200)
    if state["session"]["id"] == first_id:
        raise CheckFailed("starting a second session did not replace the first")

    stale = expect(client.post(f"/matching/sessions/{first_id}/resume"), 200, 409)
    if stale.get("status") == "active":
        raise CheckFailed("the abandoned session could be resumed alongside the new one")
    step("only one clock runs at a time", f"session {first_id} was closed on the way in")


def check_cannot_report_its_own_duration(client: httpx.Client) -> None:
    session_id = expect(client.get("/matching/state"), 200)["session"]["id"]

    ended = expect(
        client.post(f"/matching/sessions/{session_id}/end", json={"seconds": 9999}), 200
    )
    if ended["seconds"] > 120:
        raise CheckFailed(f"the server accepted a client-supplied duration: {ended['seconds']}s")
    step("duration comes from the server", f"claimed 9999s, recorded {ended['seconds']}s")

    used = expect(client.get("/matching/allowance"), 200)["used_seconds"]
    if used > 120:
        raise CheckFailed(f"the fake duration reached the allowance: {used}s used")
    step("allowance reflects real time only", f"{used}s spent")


def check_history_ignores_misclicks(client: httpx.Client) -> None:
    history = expect(client.get("/matching/sessions"), 200)
    if history:
        raise CheckFailed(f"sessions of a few seconds were counted as practice: {history}")
    step("history drops misclicks", "nothing under 20s was recorded")


def check_no_match_is_refused(client: httpx.Client) -> None:
    """Meron speaks Afaan Oromo and English and wants Tigrinya — no Amharic trade."""
    response = client.post(
        "/matching/sessions",
        json={"peer_id": 5, "speaks": ["amharic"], "wants": ["amharic"]},
    )
    if response.status_code != 409:
        raise CheckFailed(
            f"a pair with no shared language was allowed to practise: {response.status_code}"
        )
    step("an impossible pair is refused", "409 rather than an empty session")


def main() -> int:
    with httpx.Client(base_url=BASE_URL, timeout=TIMEOUT) as client:
        try:
            client.get("/health")
        except httpx.HTTPError:
            print(f"Nothing is listening on {BASE_URL}. Start the API first.")
            return 1

        try:
            sign_up(client)
            peer_id = check_directory(client)
            check_fresh_allowance(client)
            first_id = check_session_clock(client, peer_id)
            check_cannot_double_spend(client, peer_id, first_id)
            check_cannot_report_its_own_duration(client)
            check_history_ignores_misclicks(client)
            check_no_match_is_refused(client)
        except CheckFailed as failure:
            print(f"  [FAIL] {failure}")
            return 1

    print("\nPeer matching works against the live database, and the allowance holds.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
