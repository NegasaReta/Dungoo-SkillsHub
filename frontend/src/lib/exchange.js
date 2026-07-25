/**
 * The free tier gives every user 40 minutes of peer language exchange per day
 * (SRS section 2.5). Usage is tracked locally for the mockup; the real build
 * enforces the allowance server-side.
 */
const USAGE_KEY = 'dungoo.exchange.usage'

export const DAILY_LIMIT_SECONDS = 40 * 60

const today = () => new Date().toISOString().slice(0, 10)

/** Seconds used today. A stored entry from an earlier day resets to zero. */
export function readUsedSeconds() {
  try {
    const entry = JSON.parse(localStorage.getItem(USAGE_KEY) ?? '{}')
    return entry?.date === today() ? Number(entry.seconds) || 0 : 0
  } catch {
    return 0
  }
}

export function writeUsedSeconds(seconds) {
  localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today(), seconds }))
}

export function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(safe / 60)
  return `${String(minutes).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}
