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
- `src/i18n/en.js` — every UI string, so the Amharic, Afaan Oromoo, and Tigrinya
  translations later are a new file rather than a hunt through components

## Skill Passport

`/passport` reads `GET /passport/me`, which returns the credential already
aggregated — the page does no score maths of its own. Two fields are ids, not copy:
`level` and each `milestones[].id` map to labels in `src/i18n/en.js`, so a new band
or milestone from the backend needs a matching key there.

Scores use the 1-5 rubric and `0` means "not scored yet", which is why they go
through `src/lib/scores.js` instead of being formatted inline: a zero has to render
as a dash, never as 0.0.

## Peer matching

`/matching` gets both its partners and its clock from the backend. Nothing on this
page counts time: the 40-minute daily allowance is only a limit if the side being
limited is not the side doing the counting, and it used to live in `localStorage`
where clearing one key bought an unlimited day.

So `useExchangeSession` sends *start*, *pause*, *resume*, and *end*, and takes the
returned numbers as the truth. It does tick once a second, but only so the countdown
moves between requests — that estimate is overwritten by every response, and
corrected on a slow poll and whenever the tab is brought back into view.

`src/api/matching.js` is where the server's snake_case becomes the camelCase the
components were written against. `src/api/mockMatching.js` reproduces the same
behaviour in `localStorage` for demo mode, deliberately in the same shape, so the two
cannot drift apart. Its peers come from `src/data/matching.js`, which mirrors
`backend/app/data/peers.json` — keep the two in step.

## Deployment

`vercel.json` sets the build output and the SPA rewrite so client-side routes
resolve on refresh. Set `VITE_API_BASE_URL` as a project environment variable.
Recording requires HTTPS in production — `getUserMedia` is blocked on plain HTTP.

## PWA icons

`public/manifest.json` expects `public/icons/icon-192.png` and `icon-512.png`.
Drop those in before shipping.
