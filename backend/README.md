# Dungoo SkillsHub — Backend

FastAPI service that delivers interview questions, scores recorded answers with an LLM,
and aggregates the results into a skill passport. It runs and deploys independently of
the frontend.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # then fill in LLM_API_KEY
```

## Run

```bash
uvicorn app.main:app --reload
```

The API is served at `http://localhost:8000`, with interactive docs at `/docs`.
Tables are created on startup against the SQLite file in `DATABASE_URL`.

## Test

```bash
pytest
```

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./skillshub.db` |
| `LLM_API_KEY` | Key for the scoring provider; scoring is disabled when empty | empty |
| `LLM_MODEL` | Model used for rubric scoring | `gpt-4o-mini` |
| `SECRET_KEY` | Reserved for auth once it is added | `change-me` |
| `CORS_ORIGINS` | Comma-separated list of allowed browser origins | `http://localhost:5173` |

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/users` | Register a user during onboarding |
| `GET` | `/users/{user_id}` | Fetch a user |
| `GET` | `/interview/questions?role=` | Question bank for a role |
| `POST` | `/interview/sessions` | Start a session |
| `POST` | `/interview/sessions/{id}/responses` | Submit a transcript and get scored |
| `POST` | `/interview/sessions/{id}/complete` | Mark a session finished |
| `GET` | `/interview/sessions/{id}/feedback` | All feedback for a session |
| `POST` | `/passport/{user_id}/rebuild` | Re-aggregate completed sessions |
| `GET` | `/passport/{user_id}` | Fetch the skill passport |

## Deployment

`render.yaml` deploys the service on Render from the `backend/` directory.
The `Dockerfile` is an alternative for Railway, Fly.io, or any container host.
Note that SQLite on a container host is ephemeral — move `DATABASE_URL` to Postgres
before storing real user data.

## Where to add code

- `app/services/ai_scoring.py` — `_call_llm` is the single place the provider is called.
- `app/services/transcription.py` — speech-to-text provider.
- `app/data/questions.json` — the question bank, keyed by role slug.
