import { useCallback, useEffect, useRef, useState } from 'react'

import {
  endExchangeSession,
  fetchExchangeState,
  pauseExchangeSession,
  resumeExchangeSession,
  startExchangeSession,
} from '../api/index.js'
import { DAILY_LIMIT_SECONDS } from '../lib/exchange.js'

/**
 * Runs a peer exchange session against the free 40-minute daily allowance.
 *
 * The clock is the server's. This hook used to own it, counting seconds into
 * localStorage, which meant the daily limit was enforced by the same side it was
 * meant to limit. Now every start, pause, resume, and end is a request, and the
 * numbers that come back are treated as the truth.
 *
 * It still ticks locally once a second, because a countdown that only moved when
 * the network replied would look broken. That tick is presentation: it is an
 * estimate between requests, and every response overwrites it. Drift is corrected
 * on a slow poll rather than by asking the server sixty times a minute.
 */
const RESYNC_MS = 30_000

const emptyAllowance = {
  dailyLimitSeconds: DAILY_LIMIT_SECONDS,
  usedSeconds: 0,
  remainingSeconds: DAILY_LIMIT_SECONDS,
  exhausted: false,
}

export default function useExchangeSession({ filters, onRecorded } = {}) {
  const [allowance, setAllowance] = useState(emptyAllowance)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Read inside callbacks so start() always sends the filters on screen, without
  // every filter keystroke rebuilding the callback.
  const latestFilters = useRef(filters)
  latestFilters.current = filters

  const apply = useCallback((next) => {
    if (next?.allowance) setAllowance(next.allowance)
    if (next && 'session' in next) setSession(next.session)
  }, [])

  const sync = useCallback(async () => {
    try {
      apply(await fetchExchangeState())
      setError(null)
    } catch (cause) {
      setError(cause)
    } finally {
      setLoading(false)
    }
  }, [apply])

  useEffect(() => {
    sync()
  }, [sync])

  const running = session?.running ?? false

  // The local estimate. Spending time also spends the allowance, so both move.
  useEffect(() => {
    if (!running) return undefined

    const tick = setInterval(() => {
      setSession((current) => (current ? { ...current, seconds: current.seconds + 1 } : current))
      setAllowance((current) => ({
        ...current,
        usedSeconds: Math.min(current.dailyLimitSeconds, current.usedSeconds + 1),
        remainingSeconds: Math.max(0, current.remainingSeconds - 1),
        exhausted: current.remainingSeconds - 1 <= 0,
      }))
    }, 1000)

    return () => clearInterval(tick)
  }, [running])

  // Correct the estimate periodically, and whenever the tab comes back — a
  // backgrounded tab throttles its timers, so the local count falls behind.
  useEffect(() => {
    if (!running) return undefined

    const poll = setInterval(sync, RESYNC_MS)
    const onVisible = () => document.visibilityState === 'visible' && sync()
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(poll)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [running, sync])

  const run = useCallback(
    async (request) => {
      try {
        const next = await request()
        setError(null)
        return next
      } catch (cause) {
        setError(cause)
        // The server may have moved on without us; find out rather than guess.
        sync()
        return null
      }
    },
    [sync]
  )

  const start = useCallback(
    async (match) => {
      const { speaks = [], wants = [] } = latestFilters.current ?? {}
      const next = await run(() =>
        startExchangeSession({ peerId: match.id, speaks, wants })
      )
      if (next) {
        setSession(next)
        sync()
      }
    },
    [run, sync]
  )

  const pause = useCallback(async () => {
    if (!session) return
    const next = await run(() => pauseExchangeSession(session.id))
    if (next) setSession(next)
  }, [run, session])

  const resume = useCallback(async () => {
    if (!session) return
    const next = await run(() => resumeExchangeSession(session.id))
    if (next) setSession(next)
  }, [run, session])

  const end = useCallback(async () => {
    if (!session) return
    const finished = await run(() => endExchangeSession(session.id))
    setSession(null)
    if (finished) onRecorded?.(finished)
    sync()
  }, [onRecorded, run, session, sync])

  /**
   * The allowance is the hard stop. Pausing rather than ending leaves the partner
   * on screen and the session resumable tomorrow, which is what running out of
   * free time means — not that the practice is over.
   */
  useEffect(() => {
    if (allowance.exhausted && running) pause()
  }, [allowance.exhausted, pause, running])

  return {
    peer: session?.peer ?? null,
    running,
    usedSeconds: allowance.usedSeconds,
    sessionSeconds: session?.seconds ?? 0,
    remaining: allowance.remainingSeconds,
    dailyLimit: allowance.dailyLimitSeconds,
    exhausted: allowance.exhausted,
    loading,
    error,
    start,
    pause,
    resume,
    end,
  }
}
