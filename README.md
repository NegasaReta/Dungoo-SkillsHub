# Dungoo SkillsHub

An AI-powered career readiness platform for Ethiopian youth. Candidates sit a
spoken mock interview with an AI interviewer in the browser, get scored on
clarity, confidence, and STAR structure, and build a **Skill Passport** that
shows progress over time.

| | |
| --- | --- |
| **Live app** | https://skills.dungoosolutions.com |
| **Live API** | https://dungoo-skillshub.onrender.com ([`/docs`](https://dungoo-skillshub.onrender.com/docs)) |

---

## How it works

A session is a turn-by-turn conversation, not a form:

1. The candidate picks a target role, consents to camera and microphone use, and
   joins a call-style room.
2. The AI interviewer — an avatar with a speaking indicator, as though its
   camera is off — **asks a question out loud**.
3. The candidate **answers by speaking**. The answer is submitted automatically
   when they stop talking; there is no record button to manage.
4. Speech is transcribed, the next question is served, and the loop repeats for
   a fixed, capped number of turns so a demo cannot overrun.
5. On completion the whole transcript is **scored once**, and the result feeds
   the Skill Passport and dashboard.

Questions are always taken word for word from a fixed bank
(`backend/app/data/questions.json`). The model only writes the conversational
sentence in front of each question, so nothing is invented live on stage. See
[backend/README.md](backend/README.md#how-a-question-gets-asked) for the
guardrails around that.

**Video never leaves the device.** The camera is analysed in the browser with
MediaPipe, and only an aggregated summary — not frames, not landmarks — is sent
at the end. Those visual signals are reported as plain observations and never
folded into a score; clarity, confidence, and STAR come from the transcript
alone.

---

## Repository layout

Two services that build, test, and deploy **independently**. They share no
config and never import from each other.

| Directory | Stack | Details |
| --- | --- | --- |
| `frontend/` | React 18, Vite, Tailwind v4 | [frontend/README.md](frontend/README.md) |
| `backend/` | FastAPI, SQLAlchemy, Neon Postgres | [backend/README.md](backend/README.md) |
| `docs/` | SRS, diagrams, pitch material | [docs/README.md](docs/README.md) |

Team conventions, brand palette, and the non-negotiable rules live in
[AGENTS.md](AGENTS.md). Read it before contributing.

---

## Quick start

Requires Node 18+ and Python 3.11+.

```bash
# terminal 1 — API on http://localhost:8000
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then fill in the keys you need
uvicorn app.main:app --reload

# terminal 2 — app on http://localhost:5173
cd frontend
npm install
cp .env.example .env.local    # VITE_API_BASE_URL already points at :8000
npm run dev
```

Without a `DATABASE_URL` the backend falls back to a local SQLite file, so you
can run everything offline. Without API keys the interview still runs: questions
appear on screen instead of being spoken, and answers are stored unscored.

---

## Connecting the two services

Nearly every "it works locally but not in production" problem is one of these
three settings.

**1. The frontend needs the API's URL** — `VITE_API_BASE_URL`.

Vite **inlines this at build time**, not at runtime. Changing it in a hosting
dashboard does nothing until you trigger a new build. If it is missing at build
time, every API call silently resolves against the frontend's own domain, the
app receives HTML where it expects JSON, and you get a blank page.

**2. The frontend must be told to use the real API** — `VITE_USE_MOCK_API=false`.

This one defaults to *mock*. Leave it unset and the interview, passport, and
matching screens refuse to load with a "needs the live backend" message, even
though the API is running perfectly. It has to be set explicitly in every
environment, including production.

**3. The backend needs the frontend's origin** — `CORS_ORIGINS`.

A comma-separated list. It defaults to `*`, which is fine locally and should be
narrowed to the real origins before any real deployment.

### Frontend variables in full

| Variable | Purpose | If unset |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL of the API | Calls hit the frontend's own domain; blank page |
| `VITE_USE_MOCK_API` | `false` to use the real API | Falls back to mock data |
| `VITE_ELEVENLABS_AGENT_ID` | Conversational agent for voice practice | Voice practice shows a setup error |

Only variables prefixed `VITE_` reach the browser — and everything with that
prefix is compiled into the public bundle, so never give a secret one.

---

## External services

All are optional in development and degrade gracefully when unconfigured.

| Service | Used for | Key |
| --- | --- | --- |
| Google Gemini | Scoring, question selection, lead-ins, backup speech | `LLM_API_KEY` |
| ElevenLabs | Speaking questions, English transcription | `ELEVENLABS_API_KEY` |
| Addis AI | Amharic and Afan Oromo transcription | `ADDIS_AI_API_KEY` |
| Neon | Postgres database | `DATABASE_URL` |
| MediaPipe | On-device face analysis (no key, runs in browser) | — |

Speech providers cover for each other. If one has no key **or fails mid-call** —
a free-tier quota running out, for instance — the other takes over, so the
interviewer never goes silent partway through a session.

Secrets belong in `.env` files, which are gitignored, or in your host's
dashboard. Never commit them, and never give a secret a `VITE_` prefix: those
are compiled into the public JavaScript bundle.

---

## Testing

```bash
cd backend && pytest
cd frontend && npm run build
```

If test collection fails with `No module named 'google'`, your virtualenv
predates the Gemini client — rerun `pip install -r requirements.txt`.

---

## Deployment

The frontend is on **Vercel**, the backend on **Render**, each deploying on its
own from the same repository.

### Frontend (Vercel)

Set the project root to `frontend/` and add the environment variables:

```
VITE_API_BASE_URL=https://dungoo-skillshub.onrender.com
VITE_USE_MOCK_API=false
VITE_ELEVENLABS_AGENT_ID=<your agent id>
```

Redeploy after changing any of them — values are baked into the bundle at build
time, so an existing deployment keeps the old ones until it is rebuilt. `vercel.json` provides the SPA rewrite so
client-side routes survive a refresh. HTTPS is mandatory in production —
`getUserMedia` is blocked on plain HTTP, so the interview cannot start without
it.

### Backend (Render)

| Setting | Value |
| --- | --- |
| Root directory | `backend` |
| Build command | `pip install -r requirements.txt` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

Render's default start command targets gunicorn and WSGI, which will not serve
this app — FastAPI is ASGI. `backend/render.yaml` records the correct settings,
but Render only reads Blueprints from the repository root, so the service is
configured through the dashboard instead.

Set `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, and the provider keys as
environment variables on the host.

Two things worth knowing before demo day: Render's free tier sleeps after
inactivity, and the first request afterwards can take the better part of a
minute. And `create_all` adds missing *tables* but never adds *columns* to
existing ones, so a schema change needs applying to the live database by hand.

---

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | Deployed, stable |
| `Development` | Integration branch — open pull requests here |
| `frontend` / `backend` | Long-running per-service branches |

Keep a change to one service per commit. The two directories deploy separately
and their git history should stay separate too.
