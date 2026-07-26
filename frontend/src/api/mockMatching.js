/**
 * Peer exchange without a backend, for demo mode.
 *
 * It mirrors the server's shape rather than the old in-component timer: the same
 * accumulated-plus-running-stretch clock, the same allowance arithmetic, the same
 * responses. That way one hook drives both, and the mock cannot quietly diverge
 * into behaviour the real feature does not have.
 *
 * What it cannot mirror is the guarantee. Everything here lives in localStorage,
 * where the user can edit it — which is exactly why the live allowance is counted
 * on the server.
 */
import { EXCHANGE_LANGUAGES, PEERS, SKILL_LEVELS } from '../data/matching.js'
import {
  DAILY_LIMIT_SECONDS,
  readExchangeSessions,
  recordExchangeSession,
} from '../lib/exchange.js'
import { rankPeers } from '../lib/matching.js'

const OPEN_KEY = 'dungoo.exchange.open'

const today = () => new Date().toISOString().slice(0, 10)
const nowIso = () => new Date().toISOString()
const secondsSince = (iso) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))

function readOpen() {
  try {
    return JSON.parse(localStorage.getItem(OPEN_KEY) ?? 'null')
  } catch {
    return null
  }
}

function writeOpen(session) {
  if (session) localStorage.setItem(OPEN_KEY, JSON.stringify(session))
  else localStorage.removeItem(OPEN_KEY)
}

function elapsed(session) {
  if (!session) return 0
  return session.accumulatedSeconds + (session.resumedAt ? secondsSince(session.resumedAt) : 0)
}

function usedToday() {
  const finished = readExchangeSessions()
    .filter((session) => session.started_at?.slice(0, 10) === today())
    .reduce((total, session) => total + (session.seconds ?? 0), 0)

  return Math.min(DAILY_LIMIT_SECONDS, finished + elapsed(readOpen()))
}

function allowance() {
  const used = usedToday()
  return {
    date: today(),
    dailyLimitSeconds: DAILY_LIMIT_SECONDS,
    usedSeconds: used,
    remainingSeconds: Math.max(0, DAILY_LIMIT_SECONDS - used),
    exhausted: used >= DAILY_LIMIT_SECONDS,
  }
}

function shape(session) {
  if (!session) return null

  return {
    id: session.id,
    status: session.status,
    running: session.status === 'active',
    seconds: elapsed(session),
    startedAt: session.startedAt,
    endedAt: session.endedAt ?? null,
    peer: {
      id: session.peer.id,
      name: session.peer.name,
      initials: session.peer.initials,
      teaches: session.peer.teaches,
      learns: session.peer.learns,
      mutual: session.peer.mutual,
    },
  }
}

export async function fetchMatchingOptions() {
  return {
    languages: EXCHANGE_LANGUAGES,
    levels: SKILL_LEVELS,
    industries: [...new Set(PEERS.map((peer) => peer.industry))].sort(),
    dailyLimitSeconds: DAILY_LIMIT_SECONDS,
  }
}

export async function fetchPeers(filters = {}) {
  return rankPeers(PEERS, filters)
}

export async function fetchAllowance() {
  return allowance()
}

export async function fetchExchangeState() {
  return { allowance: allowance(), session: shape(readOpen()) }
}

export async function startExchangeSession({ peerId, speaks = [], wants = [] }) {
  if (allowance().exhausted) {
    const error = new Error("Today's free exchange time is used up. It resets at midnight.")
    error.status = 429
    throw error
  }

  // Closing whatever was left open keeps one clock running, as the server does.
  const stale = readOpen()
  if (stale) await endExchangeSession(stale.id)

  const peer = PEERS.find((candidate) => candidate.id === Number(peerId))
  if (!peer) throw new Error('Peer not found')

  const [match] = rankPeers([peer], { ...{ speaks, wants }, industry: 'any', level: 'any' })
  if (!match) throw new Error('You and this partner have no language in common to practise')

  const session = {
    id: Date.now(),
    peer: {
      id: peer.id,
      name: peer.name,
      initials: peer.initials,
      teaches: match.teaches,
      learns: match.learns,
      mutual: match.mutual,
    },
    status: 'active',
    accumulatedSeconds: 0,
    startedAt: nowIso(),
    resumedAt: nowIso(),
  }
  writeOpen(session)
  return shape(session)
}

export async function pauseExchangeSession() {
  const session = readOpen()
  if (!session || session.status !== 'active') return shape(session)

  const paused = {
    ...session,
    accumulatedSeconds: elapsed(session),
    resumedAt: null,
    status: 'paused',
  }
  writeOpen(paused)
  return shape(paused)
}

export async function resumeExchangeSession() {
  const session = readOpen()
  if (!session || session.status !== 'paused') return shape(session)
  if (allowance().exhausted) {
    const error = new Error("Today's free exchange time is used up. It resets at midnight.")
    error.status = 429
    throw error
  }

  const resumed = { ...session, resumedAt: nowIso(), status: 'active' }
  writeOpen(resumed)
  return shape(resumed)
}

export async function endExchangeSession() {
  const session = readOpen()
  if (!session) return null

  const seconds = elapsed(session)
  recordExchangeSession({ peer: session.peer, seconds, startedAt: session.startedAt })
  writeOpen(null)

  return shape({
    ...session,
    accumulatedSeconds: seconds,
    resumedAt: null,
    status: 'completed',
    endedAt: nowIso(),
  })
}

export async function fetchExchangeSessions() {
  return readExchangeSessions()
}
