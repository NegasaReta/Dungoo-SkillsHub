/**
 * The free tier gives every user 40 minutes of peer language exchange per day
 * (SRS section 2.5). Usage is tracked locally for the mockup; the real build
 * enforces the allowance server-side.
 */
const USAGE_KEY = 'dungoo.exchange.usage'
const SESSIONS_KEY = 'dungoo.exchange.sessions'

export const DAILY_LIMIT_SECONDS = 40 * 60

/** Sessions shorter than this are treated as a misclick, not practice. */
const MIN_RECORDED_SECONDS = 20

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

/**
 * Completed exchange sessions, oldest first. These are practice history in their
 * own right, so analytics counts them alongside interview answers.
 */
export function readExchangeSessions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function recordExchangeSession({ peer, seconds, startedAt }) {
  if (seconds < MIN_RECORDED_SECONDS) return null

  const session = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    peer_id: peer?.id ?? null,
    peer_name: peer?.name ?? 'Practice partner',
    languages: [...(peer?.teaches ?? []), ...(peer?.learns ?? [])],
    mutual: Boolean(peer?.mutual),
    seconds,
    started_at: startedAt ?? new Date().toISOString(),
    ended_at: new Date().toISOString(),
  }

  localStorage.setItem(SESSIONS_KEY, JSON.stringify([...readExchangeSessions(), session]))
  return session
}

/** Demo history support — see lib/demoData.js. Seeded rows carry `demo: true`. */
export function importExchangeSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify([...readExchangeSessions(), ...sessions]))
}

export function removeDemoExchangeSessions() {
  const kept = readExchangeSessions().filter((session) => !session.demo)
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(kept))
}

export function hasDemoExchangeSessions() {
  return readExchangeSessions().some((session) => session.demo)
}

export function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(safe / 60)
  return `${String(minutes).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}
