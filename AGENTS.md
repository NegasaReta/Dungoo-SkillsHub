# AGENTS.md — Dungoo SkillsHub

This file guides Cursor (and any AI coding agent) working in this repo. Read this before generating code. Keep every suggestion consistent with what's written here rather than introducing new patterns, libraries, or colors.

## Project Overview

Dungoo SkillsHub is an AI-powered career readiness platform for Ethiopian youth: peer language exchange, an AI communication practice engine, an AI video mock interview simulator, soft-skills drills, and a persistent "Skill Passport" credential. This repo is being built for a hackathon demo — prioritize a narrow, working, polished flow over broad, half-finished features.

## Tech Stack (do not deviate)

- **Frontend:** React (Vite), Tailwind CSS, deployed independently (e.g., Vercel)
- **Backend:** FastAPI, deployed independently (e.g., Render/Railway)
- **Database:** SQLite for the hackathon build (swap-ready for Postgres later — use SQLAlchemy so the swap is trivial)
- **AI:** Direct LLM API calls for scoring/feedback (no LangGraph/RAG needed here — that's DungooPrep's stack, not this one)
- **Media capture:** Browser `MediaRecorder` API for interview video/audio

## Folder Structure

```
dungoo-skillshub/
├── frontend/        # independent React PWA — own package.json, own .env
├── backend/         # independent FastAPI service — own requirements.txt, own .env
└── docs/            # SRS, diagrams, pitch materials (non-code)
```

Frontend and backend must stay fully independent: no shared config files at the repo root, no cross-imports. The only coupling point is the API base URL, set via `VITE_API_BASE_URL` in the frontend's `.env`. CORS is configured entirely in `backend/app/main.py`.

## Brand Theme

Use Dungoo's existing brand palette — do not invent new colors. Define these in the `@theme` block of `frontend/src/index.css` (Tailwind v4 has no `tailwind.config.js`):

| Token | Hex | Usage |
|---|---|---|
| `primary` (navy) | `#0F172A` | Headers, nav, primary buttons, Skill Passport background |
| `accent` (gold) | `#F59E0B` | CTAs, score highlights, badges |
| `brand-blue` (logo blue) | `#1B4A8F` | Logo mark and links only — use sparingly |
| `surface` | `#F4F7FB` | Card and section backgrounds |

## Build Priorities

Build in this order. Do not start a lower-priority module until the one above it works end-to-end.

### P0 — Core demo path (must work live)
1. **Project scaffold** — Vite React PWA + FastAPI, both deployed to a live URL immediately (never demo from localhost only).
2. **Minimal Onboarding** — name + target role/industry, 2 screens, stored in SQLite.
3. **AI Video Mock Interview Simulator** — the centerpiece:
   - Fixed question bank per role in `backend/app/data/questions.json` — do not generate questions live on stage.
   - `MediaRecorder`-based capture, one question at a time.
   - Submit → transcribe → LLM scores clarity, confidence, STAR structure (1–5 each + one-line feedback per axis).
   - Show per-answer feedback immediately.
4. **Skill Passport** — aggregate scores into one credential view. This is the "wow" screen — give it real design attention.
5. **Progress Dashboard** — one chart (Recharts) visualizing clarity/confidence/STAR from the same score object.

### P1 — Only if time remains
- **Peer Language Exchange** — static mockup screen (fake match + fake 40-min timer), not live matching.
- **AI Communication Practice Engine** — fold into the interview flow as an extra mode if time allows; otherwise skip.

### P2 — Do not build; pitch-deck only
- Marketplace, Verification System, Admin CMS, Notifications.

## Coding Conventions

- One module, one focused change per prompt/commit — don't ask for the whole app at once.
- Keep components small and colocated by feature (`components/interview/`, `components/passport/`, etc.).
- Pydantic schemas for every request/response; no raw dicts crossing the API boundary.
- Test the AI scoring prompt in isolation (`backend/tests/test_ai_scoring.py`) against sample transcripts before wiring it into the UI.
- Env vars only for secrets/config (`LLM_API_KEY`, `DATABASE_URL`, `VITE_API_BASE_URL`) — never hardcode keys.
- No new dependencies without a clear reason tied to a P0/P1 feature above.

## Non-Functional Guardrails

- Must run acceptably on low-bandwidth mobile connections — keep payloads (esp. video) small; compress client-side where possible.
- Encrypt/secure any stored recordings and personal data; require explicit consent before capture.
- Multi-language UI strings should be structured for future localization (Amharic, Afaan Oromoo, Tigrinya) even if only English ships for the hackathon — don't hardcode strings deep in components.

## Demo-Day Safety Net

Once the P0 flow is stable, record a backup video of it working end-to-end in case live AI calls fail on venue wifi.


## Non-Negotiable Rules — Dungoo SkillsHub

1. NEVER hardcode API keys, secrets, or credentials in code. All secrets go in .env files only, and .env is always in .gitignore.
2. NEVER touch frontend/ and backend/ in the same commit unless the change is strictly the API contract between them. They deploy independently — keep them independent in git history too.
3. NEVER generate interview questions live via LLM for the demo. Questions come only from backend/app/data/questions.json. No exceptions, even "just to test."
4. NEVER introduce a new library, framework, or database without explicit approval. Stack is locked: React + Vite + Tailwind, FastAPI + SQLAlchemy + SQLite.
5. NEVER ship a feature from P1 or P2 before every P0 module works end-to-end, live, on a deployed URL — not localhost.
6. NEVER store or transmit user recordings/personal data without encryption and without an explicit consent step in the flow.
7. NEVER use colors outside the defined Tailwind theme (primary #0F172A, accent #F59E0B, brand-blue #1B4A8F, surface #F4F7FB). No ad hoc hex values in components.
8. NEVER merge a change to the AI scoring prompt without testing it against sample transcripts in backend/tests/test_ai_scoring.py first.
9. NEVER let a build go untested on a real low-end Android device or throttled connection before demo day.
10. NEVER skip the backup demo recording once the P0 flow is stable — no live demo without a fallback video.