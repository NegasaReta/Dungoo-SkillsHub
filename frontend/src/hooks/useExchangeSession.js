import { useCallback, useEffect, useRef, useState } from 'react'

import {
  DAILY_LIMIT_SECONDS,
  readUsedSeconds,
  recordExchangeSession,
  writeUsedSeconds,
} from '../lib/exchange.js'

/**
 * Runs a peer exchange session against the free 40-minute daily allowance.
 * No audio or video is exchanged — this is the FR-2 mockup — but the clock, the
 * daily budget, and the recorded session history behave the way the real feature
 * will, so analytics can count exchange practice as real progress.
 */
export default function useExchangeSession({ onRecorded } = {}) {
  const [usedSeconds, setUsedSeconds] = useState(readUsedSeconds)
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [peer, setPeer] = useState(null)
  const [running, setRunning] = useState(false)
  const startedAt = useRef(null)

  const remaining = Math.max(0, DAILY_LIMIT_SECONDS - usedSeconds)

  useEffect(() => {
    if (!running) return undefined

    const tick = setInterval(() => {
      setUsedSeconds((seconds) => {
        const next = Math.min(DAILY_LIMIT_SECONDS, seconds + 1)
        writeUsedSeconds(next)
        return next
      })
      setSessionSeconds((seconds) => seconds + 1)
    }, 1000)

    return () => clearInterval(tick)
  }, [running])

  // The allowance is the hard stop: the session ends itself when it runs out.
  useEffect(() => {
    if (remaining === 0) setRunning(false)
  }, [remaining])

  const start = useCallback((nextPeer) => {
    if (readUsedSeconds() >= DAILY_LIMIT_SECONDS) return

    startedAt.current = new Date().toISOString()
    setSessionSeconds(0)
    setPeer(nextPeer)
    setRunning(true)
  }, [])

  const pause = useCallback(() => setRunning(false), [])
  const resume = useCallback(() => setRunning(remaining > 0), [remaining])

  const end = useCallback(() => {
    setRunning(false)

    const recorded = recordExchangeSession({
      peer,
      seconds: sessionSeconds,
      startedAt: startedAt.current,
    })
    if (recorded) onRecorded?.(recorded)

    setPeer(null)
    setSessionSeconds(0)
  }, [onRecorded, peer, sessionSeconds])

  return {
    peer,
    running,
    usedSeconds,
    sessionSeconds,
    remaining,
    exhausted: remaining === 0,
    start,
    pause,
    resume,
    end,
  }
}
