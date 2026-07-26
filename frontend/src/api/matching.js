/**
 * Real peer-exchange endpoints. Reach these through api/index.js rather than
 * importing this file directly, so the mock/live switch keeps working.
 *
 * The server speaks snake_case and slugs; the matching components were written
 * against camelCase. Translating here keeps that mismatch in one file instead of
 * spreading `match_percent` through the interface.
 *
 * Note what is absent: nothing sends a duration. The server times the session
 * from its own clock, because the 40-minute daily allowance is only a limit if
 * the side being limited is not the side doing the counting.
 */
import client from './client.js'
import { asIntId } from '../lib/ids.js'

const usingMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'

function requireLiveApi() {
  if (usingMockApi) {
    throw new Error(
      'Peer matching needs the live backend. Set VITE_USE_MOCK_API=false in frontend/.env.local, restart the dev server, and sign in again.'
    )
  }
}

function toMatch(peer) {
  const { looking_for: lookingFor, match_percent: matchPercent, ...rest } = peer
  return { ...rest, lookingFor, matchPercent }
}

/** Initials for a restored session, where only the partner's name came back. */
function initialsOf(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

/**
 * Splits a session into the two things the interface treats separately: who the
 * partner is, and how the clock stands.
 */
function toSession(session) {
  if (!session) return null

  return {
    id: session.id,
    status: session.status,
    running: session.status === 'active',
    seconds: session.seconds,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    peer: {
      id: session.peer_id,
      name: session.peer_name,
      initials: initialsOf(session.peer_name),
      teaches: session.teaches,
      learns: session.learns,
      mutual: session.mutual,
    },
  }
}

export async function fetchMatchingOptions() {
  requireLiveApi()
  const { data } = await client.get('/matching/options')
  return {
    languages: data.languages,
    levels: data.levels,
    industries: data.industries,
    dailyLimitSeconds: data.daily_limit_seconds,
  }
}

export async function fetchPeers({ speaks, wants, industry, level, onlineOnly } = {}) {
  requireLiveApi()
  const { data } = await client.get('/matching/peers', {
    params: { speaks, wants, industry, level, online_only: onlineOnly },
  })
  return data.map(toMatch)
}

/** The allowance plus any session still open, so a reload can restore the page. */
export async function fetchExchangeState() {
  requireLiveApi()
  const { data } = await client.get('/matching/state')
  return { allowance: toAllowance(data.allowance), session: toSession(data.session) }
}

function toAllowance(allowance) {
  return {
    date: allowance.date,
    dailyLimitSeconds: allowance.daily_limit_seconds,
    usedSeconds: allowance.used_seconds,
    remainingSeconds: allowance.remaining_seconds,
    exhausted: allowance.exhausted,
  }
}

export async function fetchAllowance() {
  requireLiveApi()
  const { data } = await client.get('/matching/allowance')
  return toAllowance(data)
}

export async function startExchangeSession({ peerId, speaks, wants }) {
  requireLiveApi()
  const { data } = await client.post('/matching/sessions', {
    peer_id: asIntId(peerId, 'Peer id'),
    speaks,
    wants,
  })
  return toSession(data)
}

const act = (verb) => async (sessionId) => {
  requireLiveApi()
  const id = asIntId(sessionId, 'Session id')
  const { data } = await client.post(`/matching/sessions/${id}/${verb}`)
  return toSession(data)
}

export const pauseExchangeSession = act('pause')
export const resumeExchangeSession = act('resume')
export const endExchangeSession = act('end')

/** Completed practice, for the progress screens. */
export async function fetchExchangeSessions() {
  requireLiveApi()
  const { data } = await client.get('/matching/sessions')
  return data
}
