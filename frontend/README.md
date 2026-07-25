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
| `VITE_ELEVENLABS_AGENT_ID` | Public ElevenLabs agent used by voice practice (an ID, not a key) |

Vite only exposes variables prefixed with `VITE_`, and they are inlined at build
time — so set them in your host's dashboard before building, not after.

## Structure

- `src/pages/` — one component per route, wired up in `App.jsx`
- `src/components/` — grouped by feature (`interview`, `passport`, `dashboard`, `practice`) plus shared `common/`
- `src/api/client.js` — the axios instance every request should go through
- `src/hooks/useMediaRecorder.js` — microphone/camera capture for interview answers
- `src/context/UserContext.jsx` — current user state

## Communication practice

`/practice` offers two independent modes. Text mode posts to the backend's `/practice/text`
and renders the corrected sentence with each fix highlighted inline — hover for the
explanation, click to pin it. Voice mode connects straight to a public ElevenLabs agent with
`@elevenlabs/react`; the agent does all speech-to-text and text-to-speech, so there is no
audio code here and no ElevenLabs key in the bundle, only the agent ID.

Voice mode dials the agent as soon as the tab opens, so the browser asks for the microphone
straight away. Ending the call does not redial — a "Reconnect" button appears instead — and
auto-connect is capped at two attempts so a refused connection cannot loop.

### What voice mode needs on the ElevenLabs dashboard

Background noise opening a turn is tuned on the agent, not here: the platform does not
expose voice-detection thresholds to clients, so sensitivity lives in the dashboard's turn
eagerness and turn timeout settings. What this app does client-side is hold-to-talk — the
mic stays muted between turns via the SDK's controlled `micMuted`, so room noise cannot
start a turn at all. A hands-free checkbox restores the always-open mic.

## Deployment

`vercel.json` sets the build output and the SPA rewrite so client-side routes
resolve on refresh. Set `VITE_API_BASE_URL` as a project environment variable.
Recording requires HTTPS in production — `getUserMedia` is blocked on plain HTTP.

## PWA icons

`public/manifest.json` expects `public/icons/icon-192.png` and `icon-512.png`.
Drop those in before shipping.
