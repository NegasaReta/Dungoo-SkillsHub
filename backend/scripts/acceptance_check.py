"""End-to-end check of the auth + onboarding flow against a running server.

Usage: python scripts/acceptance_check.py [base_url]
"""

import sys
import uuid

import httpx

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
EMAIL = f"acceptance.{uuid.uuid4().hex[:8]}@example.com"
PASSWORD = "supersecret123"

failures: list[str] = []


def check(label: str, condition: bool, detail: object = "") -> None:
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label} {detail}")
    if not condition:
        failures.append(label)


with httpx.Client(base_url=BASE_URL, timeout=15.0) as client:
    r = client.post("/auth/signup", json={"email": EMAIL, "password": PASSWORD})
    body = r.json()
    check(
        "1. POST /auth/signup -> 201, token, profile_completed=false",
        r.status_code == 201 and bool(body.get("access_token")) and body.get("profile_completed") is False,
        (r.status_code, body),
    )
    token = body.get("access_token", "")
    headers = {"Authorization": f"Bearer {token}"}

    r = client.get("/auth/me", headers=headers)
    body = r.json()
    check(
        "2. GET /auth/me -> 200, profile_completed=false",
        r.status_code == 200 and body.get("profile_completed") is False,
        (r.status_code, body),
    )

    profile = {
        "full_name": "Abebe Kebede",
        "education_level": "bachelor",
        "industries": ["tech", "education"],
        "phone_number": "+251912345678",
        "languages": ["amharic", "english"],
    }
    r = client.post("/profile/complete", json=profile, headers=headers)
    body = r.json()
    check(
        "3. POST /profile/complete -> 200, profile_completed=true",
        r.status_code == 200 and body.get("profile_completed") is True,
        (r.status_code, body),
    )

    r = client.post("/auth/signup", json={"email": EMAIL, "password": PASSWORD})
    check(
        "4. POST /auth/signup duplicate email -> 400",
        r.status_code == 400,
        (r.status_code, r.json()),
    )

    r = client.get("/meta/options")
    body = r.json()
    check(
        "5. GET /meta/options -> 200, three lists",
        r.status_code == 200
        and all(body.get(k) for k in ("education_levels", "industries", "languages")),
        (r.status_code, body),
    )

    r = client.post("/auth/login", json={"email": EMAIL, "password": PASSWORD})
    body = r.json()
    check(
        "6. POST /auth/login -> 200, profile_completed=true",
        r.status_code == 200 and body.get("profile_completed") is True,
        (r.status_code, body),
    )

    r = client.post("/auth/login", json={"email": EMAIL, "password": "wrongpassword"})
    check("7. POST /auth/login bad password -> 401", r.status_code == 401, r.status_code)

    r = client.get("/auth/me")
    check("8. GET /auth/me without token -> 403/401", r.status_code in (401, 403), r.status_code)

    r = client.post(
        "/profile/complete",
        json={**profile, "industries": ["space_travel"]},
        headers=headers,
    )
    check("9. POST /profile/complete unknown industry -> 422", r.status_code == 422, r.status_code)

    r = client.post(
        "/auth/signup",
        json={"email": f"short.{uuid.uuid4().hex[:8]}@example.com", "password": "short"},
    )
    check("10. POST /auth/signup password < 8 chars -> 422", r.status_code == 422, r.status_code)

    # The merged frontend's exact request shapes: names split in two, sent at
    # signup, omitted by the onboarding step, resent when settings edits them.
    fe_email = f"frontend.{uuid.uuid4().hex[:8]}@example.com"
    r = client.post(
        "/auth/signup",
        json={
            "first_name": "Hana",
            "last_name": "Tesfaye",
            "email": fe_email,
            "password": "Str0ng!pass",
        },
    )
    body = r.json()
    fe_headers = {"Authorization": f"Bearer {body.get('access_token', '')}"}
    check("11. Signup with first_name/last_name -> 201", r.status_code == 201, r.status_code)

    body = client.get("/auth/me", headers=fe_headers).json()
    check(
        "12. GET /auth/me returns split names",
        (body.get("first_name"), body.get("last_name"), body.get("full_name"))
        == ("Hana", "Tesfaye", "Hana Tesfaye"),
        (body.get("full_name"), body.get("first_name"), body.get("last_name")),
    )

    r = client.post(
        "/profile/complete",
        json={
            "education_level": "diploma",
            "industries": ["health"],
            "phone_number": "0912 345 678",
            "languages": ["amharic"],
        },
        headers=fe_headers,
    )
    body = r.json()
    check(
        "13. Onboarding payload without a name -> 200, keeps signup name",
        r.status_code == 200 and body.get("full_name") == "Hana Tesfaye",
        (r.status_code, body.get("full_name")),
    )
    check(
        "14. Local phone 0912 345 678 normalized to E.164",
        body.get("phone_number") == "+251912345678",
        body.get("phone_number"),
    )

    r = client.post(
        "/profile/complete",
        json={
            "first_name": "Hanna",
            "last_name": "Tesfaye Bekele",
            "education_level": "diploma",
            "industries": ["health"],
            "phone_number": "+251912345678",
            "languages": ["amharic"],
        },
        headers=fe_headers,
    )
    body = r.json()
    check(
        "15. Settings payload with split names round-trips",
        r.status_code == 200
        and body.get("full_name") == "Hanna Tesfaye Bekele"
        and body.get("first_name") == "Hanna"
        and body.get("last_name") == "Tesfaye Bekele",
        (r.status_code, body.get("full_name"), body.get("first_name"), body.get("last_name")),
    )

    # A user who never supplied a name must still be asked for one.
    nameless = client.post(
        "/auth/signup",
        json={"email": f"nameless.{uuid.uuid4().hex[:8]}@example.com", "password": "supersecret123"},
    ).json()
    r = client.post(
        "/profile/complete",
        json={
            "education_level": "bachelor",
            "industries": ["tech"],
            "phone_number": "+251912345678",
            "languages": ["english"],
        },
        headers={"Authorization": f"Bearer {nameless.get('access_token', '')}"},
    )
    check("16. Nameless account without a name -> 422", r.status_code == 422, r.status_code)

    r = client.post(
        "/profile/complete",
        json={
            "education_level": "bachelor",
            "industries": ["tech"],
            "phone_number": "12345",
            "languages": ["english"],
        },
        headers=fe_headers,
    )
    check("17. Implausible phone number -> 422", r.status_code == 422, r.status_code)

print()
if failures:
    print(f"{len(failures)} check(s) failed: {failures}")
    sys.exit(1)
print("All acceptance checks passed.")
