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

## Brand palette

Tailwind v4 has no `tailwind.config.js` — the palette is defined in the `@theme` block
at the top of `src/index.css` and compiled into CSS variables.

| Token | Hex | Use for |
| --- | --- | --- |
| `primary` | `#0F172A` | Headers, nav, primary buttons, body text |
| `accent` | `#F59E0B` | CTAs, score highlights, badges |
| `brand-blue` | `#1B4A8F` | Links and logo elements only, used sparingly |
| `surface` | `#F4F7FB` | Card and section backgrounds |

Each token gives you the usual utilities (`bg-primary`, `text-accent`, `border-brand-blue`).
For tints, use an opacity modifier such as `text-primary/70` rather than reaching for a
grey from Tailwind's default palette — that keeps everything on-brand.

Charts need raw color values rather than class names, so `src/theme.js` re-exports the
same tokens as `var(--color-*)` references. Add new colors to `index.css` first.

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
