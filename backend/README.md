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

### Checking the live providers

`pytest` stubs every provider, so a green suite says nothing about whether the keys in
`.env` still work. Two scripts call them for real:

```bash
python scripts/provider_check.py    # one call to each provider; needs no server
python scripts/interview_check.py   # a whole interview against a running server
```

`provider_check.py` round-trips a sentence — spoken by the TTS provider, handed back to
the STT provider — so a pass means the two halves agree on an audio format rather than
that both returned 200. `interview_check.py` then sits a full interview: it speaks a
written STAR answer, uploads it as the recording, and fails unless the transcript,
scores, engagement notes, and passport all come back populated.

Worth running before a demo. A wrong or exhausted key is invisible until a candidate is
mid-session, and both scripts cost a handful of API calls.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | Neon Postgres connection string | `sqlite:///./dungoo.db` |
| `LLM_API_KEY` | Google AI Studio key for scoring, question selection, and lead-ins; these fall back to unscored answers, a fixed question order, and the authored lead-ins when empty | empty |
| `LLM_MODEL` | Gemini model behind scoring, question selection, and lead-ins. Lite by default: one interview costs about a dozen calls, and `gemini-2.5-flash` allows 20 a day on the free tier | `gemini-flash-lite-latest` |
| `INTERVIEW_GENERATE_LEAD_INS` | Let the model write the sentence before each question. Off uses the authored lead-ins from the bank | `true` |
| `SECRET_KEY` | JWT signing secret | `change-me` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT lifetime in minutes | `10080` (7 days) |
| `CORS_ORIGINS` | Comma-separated origins, or `*` for local dev | `*` |

### Voice providers

These stay server-side. Vite inlines any `VITE_*` variable into the public bundle, so
the frontend reaches these providers through this API rather than holding the keys.

| Variable | Purpose | Default |
| --- | --- | --- |
| `TTS_PROVIDER` | Who speaks the questions: `elevenlabs` or `gemini` | `elevenlabs` |
| `STT_PROVIDER` | Who transcribes answers: `elevenlabs` or `addis` | `elevenlabs` |
| `ELEVENLABS_API_KEY` | Speech in both directions | empty |
| `ELEVENLABS_VOICE_ID` | Which voice the interviewer uses | `JBFqnCBsd6RMkjVDRZzb` |
| `ELEVENLABS_TTS_MODEL` / `ELEVENLABS_STT_MODEL` | ElevenLabs model ids | `eleven_multilingual_v2` / `scribe_v1` |
| `ADDIS_AI_API_KEY` | Addis AI, trained on Amharic and Afan Oromo | empty |
| `GEMINI_TTS_MODEL` / `GEMINI_TTS_VOICE` | Used when `TTS_PROVIDER=gemini`, on `LLM_API_KEY` | `gemini-2.5-flash-preview-tts` / `Kore` |
| `INTERVIEW_LANGUAGE` | Default answer language | `en` |
| `INTERVIEW_MAX_TURNS` | Questions per interview | `5` |

Neither choice is binding. Each provider covers for the other when its key is missing
*or* when a live call fails, because free-tier quotas tend to run out partway through a
session and a silent interviewer is the one failure a candidate cannot work around.
Addis AI takes Amharic and Afan Oromo whatever `STT_PROVIDER` says.

## Auth & onboarding endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/signup` | Create user (email/password), return JWT |
| `POST` | `/auth/login` | Verify credentials, return JWT |
| `GET` | `/auth/me` | Current user (Bearer token) |
| `POST` | `/auth/change-password` | Change the password of the signed-in user |
| `POST` | `/auth/forgot-password` | Issue a password reset link |
| `POST` | `/auth/reset-password` | Set a new password from a reset token |
| `POST` | `/profile/complete` | Save onboarding profile fields |
| `GET` | `/meta/options` | Allowed education / industry / language values |

### Changing a password while signed in

`/auth/change-password` takes `current_password` and `new_password` and is the flow for
someone who can already log in, so proving the current password is what authorises the
change. It also deletes any unused reset token for that account, since a link already in
flight would otherwise still grant a second way in. Issued JWTs stay valid until they
expire: revoking them would need a token store, which this build does not have.

### Languages

`/meta/options` serves the ten largest languages of Ethiopia (by share of speakers in
the 2007 census) followed by the ten most spoken languages worldwide (by first- plus
second-language speakers, per Ethnologue), then `other`. `/profile/complete` takes both
`languages`, what the member already speaks, and the optional `practising_languages`,
what they want to practise; peer matching pairs one against the other. Both are validated
against the same allowlist.

### Password reset

`/auth/forgot-password` answers identically whether or not the email is registered, so
it cannot be used to discover who has an account. A request stores a single-use token
(only its SHA-256 hash is persisted, in `password_reset_tokens`), retires any earlier
unused token for that user, and expires after `RESET_TOKEN_EXPIRE_MINUTES`.

There is no email provider wired up yet. The reset link is written to the server log,
which is where it should stay in a deployment. For local testing,
`DEV_EXPOSE_RESET_TOKEN=true` also returns the token in the response and the frontend
shows a "continue" link — **this must stay false anywhere reachable from the internet**,
since it would let anyone reset any account. Swapping the log line in
`app/routers/auth.py` for a real mail call is the only change needed to go live.

### Name and phone handling

The frontend edits names as `first_name` + `last_name`; the SRS and curl use a single
`full_name`. Signup and `/profile/complete` accept either, store one collapsed name,
and `/auth/me` returns all three so both styles work without a translation layer. The
split happens on the first space, so `Abebe Kebede Bekele` comes back as first `Abebe`,
last `Kebede Bekele`.

A name is required overall but not at every step: the onboarding form omits it because
signup already captured it, and only an account with no name at all gets a 422.

Phone numbers are stored in E.164. Local Ethiopian forms are normalized on the way in,
so `0912345678`, `912345678`, `251912345678`, and `+251912345678` all persist as
`+251912345678`.

## Other endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/interview/roles` | Roles the question bank covers |
| `GET` | `/interview/questions?role=` | Question bank for a role |
| `POST` | `/interview/sessions` | Start a session |
| `POST` | `/interview/sessions/{id}/turns/next` | Issue the next question |
| `GET` | `/interview/sessions/{id}/turns/{index}/audio` | That question as spoken audio |
| `POST` | `/interview/sessions/{id}/turns/{index}/answer` | Upload a recording, get its transcript |
| `POST` | `/interview/sessions/{id}/responses` | Submit a transcript and get scored |
| `POST` | `/interview/sessions/{id}/complete` | Finish a session, score its answers, update the passport |
| `GET` | `/interview/sessions/{id}/feedback` | All feedback for a session |
| `GET` | `/passport/me` | The signed-in user's Skill Passport |

## Deployment

`render.yaml` deploys the service on Render from the `backend/` directory.
The `Dockerfile` is an alternative for Railway, Fly.io, or any container host.
Set `DATABASE_URL` and `SECRET_KEY` as environment variables on the host rather than
shipping a `.env`, and lock `CORS_ORIGINS` down to the real frontend origin.

## Where to add code

- `app/core/security.py` — password hashing and JWT helpers.
- `app/services/llm.py` — the single place Gemini is called for text.
- `app/services/ai_scoring.py` — the rubric prompt and how a reply becomes scores.
- `app/services/session_scoring.py` — turns a finished session into feedback reports.
- `app/services/passport_builder.py` — aggregates reports into the Skill Passport.
- `app/services/transcription.py` — speech-to-text provider.
- `app/services/lead_ins.py` — the sentence said before each question, and its guards.
- `app/data/questions.json` — the question bank, keyed by role slug.

## How a question gets asked

The bank question is always asked word for word. What the model contributes is the
sentence in front of it — "Most of this job is reading code you did not write." — so
the interviewer sounds like a person raising a topic rather than a form being read
out. `POST /interview/sessions` writes one lead-in per question of the role into
`interview_sessions.lead_ins` in a single batched call, while the candidate is still
on the joining screen; no turn ever waits on the model mid-conversation.
`InterviewTurn.question_text` then stores lead-in plus question exactly as spoken,
which is what gets synthesised, captioned, and scored.

Two things keep this from corrupting the assessment:

- Generated lines are checked by `lead_ins.is_usable` before they can be spoken. A
  line that asks a question, runs long, restates the question, or uses rubric
  vocabulary ("give me a concrete example with a measurable result") is dropped in
  favour of the authored one. Coaching the shape of an answer would turn the STAR
  score into a test of whether the candidate followed instructions.
- Every question in the bank carries an authored `lead_in`. It is the fallback for a
  rejected line, a missing id, a refusal, a timeout, or no API key, so the
  interviewer always has something to say. The opening greeting is never generated.

Set `INTERVIEW_GENERATE_LEAD_INS=false` to run entirely on the authored text.

## Skill Passport

`GET /passport/me` derives the credential from stored feedback reports on every
request, so it cannot drift from the sessions behind it. Scoring happens once, when
`POST /interview/sessions/{id}/complete` runs: each answered turn is scored in
parallel, unscorable answers are skipped rather than stored as zeros, and the
aggregate is written to `skill_passports`.

`level` and `milestones[].id` are keys, not display text — the frontend maps them to
copy in `src/i18n/en.js` so they can be translated. Scores use the 1-5 rubric, where
`0` means "not scored yet" rather than a failing mark.
