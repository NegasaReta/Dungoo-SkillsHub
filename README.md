# Dungoo SkillsHub

Practice interviews in the browser, get scored on clarity, confidence, and STAR
structure, and build a skill passport that shows progress over time.

The repository holds two services that run and deploy independently:

| Directory | Stack | Setup |
| --- | --- | --- |
| `frontend/` | React (Vite) PWA | see [frontend/README.md](frontend/README.md) |
| `backend/` | FastAPI + SQLite | see [backend/README.md](backend/README.md) |

`docs/` holds the non-code material: SRS, diagrams, and pitch deck.

## Quick start

Run each service in its own terminal:

```bash
# terminal 1
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && cp .env.example .env
uvicorn app.main:app --reload            # http://localhost:8000

# terminal 2
cd frontend && npm install && cp .env.example .env.local
npm run dev                              # http://localhost:5173
```

The two are connected by exactly two settings: `VITE_API_BASE_URL` in the frontend
must point at the backend, and the frontend's origin must appear in the backend's
`CORS_ORIGINS`. The defaults in both `.env.example` files already line up for local
development.
