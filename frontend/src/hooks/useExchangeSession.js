import { useCallback, useEffect, useState } from 'react'

import { DAILY_LIMIT_SECONDS, readUsedSeconds, writeUsedSeconds } from '../lib/exchange.js'

/**
 * Runs a peer exchange session against the free 40-minute daily allowance.
 * No audio or video is exchanged — this is the FR-2 mockup — but the clock and the
 * daily budget behave the way the real feature will.
 */
export default function useExchangeSession() {
  const [usedSeconds, setUsedSeconds] = useState(readUsedSeconds)
  const [peer, setPeer] = useState(null)
  const [running, setRunning] = useState(false)

  const remaining = Math.max(0, DAILY_LIMIT_SECONDS - usedSeconds)

  useEffect(() => {
    if (!running) return undefined

    const tick = setInterval(() => {
      setUsedSeconds((seconds) => {
        const next = Math.min(DAILY_LIMIT_SECONDS, seconds + 1)
        writeUsedSeconds(next)
        return next
      })
    }, 1000)

    return () => clearInterval(tick)
  }, [running])

  // The allowance is the hard stop: the session ends itself when it runs out.
  useEffect(() => {
    if (remaining === 0) setRunning(false)
  }, [remaining])

  const start = useCallback((nextPeer) => {
    if (readUsedSeconds() >= DAILY_LIMIT_SECONDS) return
    setPeer(nextPeer)
    setRunning(true)
  }, [])

  const pause = useCallback(() => setRunning(false), [])
  const resume = useCallback(() => setRunning(remaining > 0), [remaining])

  const end = useCallback(() => {
    setRunning(false)
    setPeer(null)
  }, [])

  return {
    peer,
    running,
    usedSeconds,
    remaining,
    exhausted: remaining === 0,
    start,
    pause,
    resume,
    end,
  }
}
