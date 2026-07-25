# Dungoo SkillsHub — Frontend

React (Vite) PWA for onboarding, running practice interviews in the browser, and
viewing the resulting skill passport. It builds and deploys independently of the
backend; the only coupling is the API base URL.

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local   # point VITE_API_BASE_URL at your backend
```

## Run

```bash
npm run dev
```

The app runs at `http://localhost:5173`. Make sure that origin is listed in the
backend's `CORS_ORIGINS`.

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend |

Vite only exposes variables prefixed with `VITE_`, and they are inlined at build
time — so set them in your host's dashboard before building, not after.

## Structure

- `src/pages/` — one component per route, wired up in `App.jsx`
- `src/components/` — grouped by feature (`interview`, `passport`, `dashboard`) plus shared `common/`
- `src/api/client.js` — the axios instance every request should go through
- `src/hooks/useMediaRecorder.js` — microphone/camera capture for interview answers
- `src/context/UserContext.jsx` — current user state

## Deployment

`vercel.json` sets the build output and the SPA rewrite so client-side routes
resolve on refresh. Set `VITE_API_BASE_URL` as a project environment variable.
Recording requires HTTPS in production — `getUserMedia` is blocked on plain HTTP.

## PWA icons

`public/manifest.json` expects `public/icons/icon-192.png` and `icon-512.png`.
Drop those in before shipping.
