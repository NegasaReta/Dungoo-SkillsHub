# Dungoo SkillsHub — Backend

FastAPI service that handles auth/onboarding, delivers interview questions, scores
recorded answers with an LLM, and aggregates results into a skill passport. It runs
and deploys independently of the frontend.

## Setup

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # then fill in LLM_API_KEY / SECRET_KEY
```

## Run

```bash
uvicorn app.main:app --reload
```

The API is served at `http://localhost:8000`, with interactive docs at `/docs`.
Tables are created on startup against `DATABASE_URL`.

## Database

`DATABASE_URL` points at Neon Postgres. Paste the connection string from the Neon
dashboard as-is — the bare `postgresql://` URL is rewritten to `postgresql+psycopg://`
in `app/core/config.py`, and `sslmode`/`channel_binding` query parameters are passed
straight through to the driver. Set it in `.env`, which is gitignored; never commit a
connection string.

```bash
python scripts/init_db.py     # create tables and print what the target database holds
python scripts/show_users.py  # list stored users
```

A SQLite fallback still works for offline development: set
`DATABASE_URL=sqlite:///./dungoo.db`. Connection pooling settings adapt automatically.

## Test

```bash
pytest
```

### Testing auth in Swagger UI

With the server running, open `http://localhost:8000/docs`. Every request body is
prefilled with a valid example, so each step is "Try it out" → "Execute".

1. **`POST /auth/signup`** — change the email to something new, keep the password at
   8+ characters. Expect `201` with `access_token` and `profile_completed: false`.
   Copy the `access_token` value from the response (without the quotes).
2. **Authorize** — click the green **Authorize** button at the top right, paste the
   token into the `HTTPBearer` value box, and click Authorize. Paste the raw token
   only; Swagger adds the `Bearer ` prefix itself.
3. **`GET /auth/me`** — expect `200` with `profile_completed: false`.
4. **`GET /meta/options`** — expect `200` with the education, industry, and language
   lists that the profile form is built from.
5. **`POST /profile/complete`** — execute the prefilled example. Expect `200` with
   `profile_completed: true`. Re-run `GET /auth/me` to confirm it stuck.
6. **`POST /auth/login`** — same email/password as step 1. Expect `200` with a fresh
   token and `profile_completed: true`.

Failure cases worth clicking through: signing up twice with the same email returns
`400`, a wrong password on login returns `401`, `GET /auth/me` without authorizing
returns `401`, and an industry or language outside the allowed lists returns `422`
naming the bad values.

### Scripted equivalent

The same flow, plus the failure cases, runs headlessly against a live server:

```bash
python scripts/acceptance_check.py            # defaults to http://127.0.0.1:8000
```

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | Neon Postgres connection string | `sqlite:///./dungoo.db` |
| `LLM_API_KEY` | Key for the scoring provider; scoring is disabled when empty | empty |
| `LLM_MODEL` | Model used for rubric scoring | `gpt-4o-mini` |
| `GEMINI_API_KEY` | Key for the text-mode communication coach; `/practice/text` returns `503` when empty | empty |
| `GEMINI_MODEL` | Model used by the communication coach | `gemini-3.1-flash-lite` |
| `SECRET_KEY` | JWT signing secret | `change-me` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT lifetime in minutes | `10080` (7 days) |
| `CORS_ORIGINS` | Comma-separated origins, or `*` for local dev | `*` |

## Auth & onboarding endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/signup` | Create user (email/password), return JWT |
| `POST` | `/auth/login` | Verify credentials, return JWT |
| `GET` | `/auth/me` | Current user (Bearer token) |
| `POST` | `/profile/complete` | Save onboarding profile fields |
| `GET` | `/meta/options` | Allowed education / industry / language values |

## Other endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/interview/questions?role=` | Question bank for a role |
| `POST` | `/interview/sessions` | Start a session |
| `POST` | `/interview/sessions/{id}/responses` | Submit a transcript and get scored |
| `POST` | `/interview/sessions/{id}/complete` | Mark a session finished |
| `GET` | `/interview/sessions/{id}/feedback` | All feedback for a session |
| `POST` | `/passport/{user_id}/rebuild` | Re-aggregate completed sessions |
| `GET` | `/passport/{user_id}` | Fetch the skill passport |
| `POST` | `/practice/text` | Coach one typed message: corrected text, errors, follow-up |

## Communication practice

Text mode posts to `/practice/text`, which asks Gemini for a strict JSON verdict on one
message and retries once if the reply will not parse. Voice mode never touches this
service: the frontend connects straight to a public ElevenLabs agent that holds its own
prompt, voice, and speech handling, so no ElevenLabs key belongs in this backend and there
is no token endpoint to call.

## Deployment

`render.yaml` deploys the service on Render from the `backend/` directory.
The `Dockerfile` is an alternative for Railway, Fly.io, or any container host.
Set `DATABASE_URL` and `SECRET_KEY` as environment variables on the host rather than
shipping a `.env`, and lock `CORS_ORIGINS` down to the real frontend origin.

## Where to add code

- `app/core/security.py` — password hashing and JWT helpers.
- `app/services/ai_scoring.py` — `_call_llm` is the single place the provider is called.
- `app/services/practice_coach.py` — the coaching prompt and the Gemini call behind text mode.
- `app/services/transcription.py` — speech-to-text provider.
- `app/data/questions.json` — the question bank, keyed by role slug.
