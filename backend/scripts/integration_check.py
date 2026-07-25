"""Verify the running frontend and backend are actually talking to each other.

Checks that Vite is serving, that the bundle is built against the real API rather
than the in-browser mock, that CORS allows the browser origin, and that the
frontend's own request sequence succeeds against the live backend.

Usage: python scripts/integration_check.py [frontend_url] [backend_url]
"""

import json
import re
import sys
import uuid

import httpx

FRONTEND = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5173"
BACKEND = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8000"

failures: list[str] = []


def check(label: str, condition: bool, detail: object = "") -> None:
    print(f"[{'PASS' if condition else 'FAIL'}] {label} {detail}")
    if not condition:
        failures.append(label)


with httpx.Client(timeout=30.0) as client:
    r = client.get(FRONTEND)
    check("Vite serves the app", r.status_code == 200 and "<div id=\"root\"" in r.text, r.status_code)

    # In dev, Vite prepends the resolved `import.meta.env` object to each served
    # module, so it reports exactly what the browser will read at runtime.
    r = client.get(f"{FRONTEND}/src/api/index.js")
    match = re.search(r"import\.meta\.env\s*=\s*(\{.*?\});", r.text, re.DOTALL)
    env = json.loads(match.group(1)) if match else {}
    check(
        "Browser reads the real API, not the mock",
        env.get("VITE_USE_MOCK_API") == "false",
        f"VITE_USE_MOCK_API={env.get('VITE_USE_MOCK_API')!r}",
    )
    check(
        "Browser points at this backend",
        (env.get("VITE_API_BASE_URL") or "").rstrip("/") == BACKEND.rstrip("/"),
        f"VITE_API_BASE_URL={env.get('VITE_API_BASE_URL')!r}",
    )

    # The browser sends a preflight before a cross-origin JSON POST.
    r = client.request(
        "OPTIONS",
        f"{BACKEND}/auth/signup",
        headers={
            "Origin": FRONTEND,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,authorization",
        },
    )
    allowed = r.headers.get("access-control-allow-origin")
    check("CORS preflight allows the frontend origin", r.status_code < 400 and bool(allowed), allowed)

    browser = {"Origin": FRONTEND, "Referer": f"{FRONTEND}/"}
    email = f"live.{uuid.uuid4().hex[:8]}@example.com"

    r = client.post(
        f"{BACKEND}/auth/signup",
        json={
            "first_name": "Liya",
            "last_name": "Girma",
            "email": email,
            "password": "Str0ng!pass",
        },
        headers=browser,
    )
    token = r.json().get("access_token", "")
    check("Signup as the browser sends it", r.status_code == 201 and bool(token), r.status_code)

    auth = {**browser, "Authorization": f"Bearer {token}"}

    body = client.get(f"{BACKEND}/auth/me", headers=auth).json()
    check(
        "Bootstrap /auth/me routes to complete-profile",
        body.get("profile_completed") is False and body.get("first_name") == "Liya",
        (body.get("first_name"), body.get("last_name"), body.get("profile_completed")),
    )

    body = client.get(f"{BACKEND}/meta/options", headers=browser).json()
    check(
        "Profile form loads its options",
        len(body.get("education_levels", [])) == 7 and len(body.get("industries", [])) == 10,
        f"{len(body.get('education_levels', []))} levels, {len(body.get('industries', []))} industries",
    )

    r = client.post(
        f"{BACKEND}/profile/complete",
        json={
            "education_level": "master",
            "industries": ["finance", "tech"],
            "phone_number": "0911223344",
            "languages": ["english", "afaan_oromo"],
        },
        headers=auth,
    )
    body = r.json()
    check(
        "Profile completion unlocks the dashboard",
        r.status_code == 200
        and body.get("profile_completed") is True
        and body.get("full_name") == "Liya Girma"
        and body.get("phone_number") == "+251911223344",
        (r.status_code, body.get("full_name"), body.get("phone_number")),
    )

    r = client.post(
        f"{BACKEND}/auth/login",
        json={"email": email, "password": "Str0ng!pass"},
        headers=browser,
    )
    check(
        "Returning login skips onboarding",
        r.status_code == 200 and r.json().get("profile_completed") is True,
        r.status_code,
    )

print()
if failures:
    print(f"{len(failures)} check(s) failed: {failures}")
    sys.exit(1)
print(f"Frontend at {FRONTEND} is fully integrated with the backend at {BACKEND}.")
