import { useCallback, useEffect, useState } from 'react'

import { fetchSessions } from '../api/index.js'
import { EMPTY_SUMMARY, summarizeSessions } from '../lib/progress.js'

/**
 * Loads the signed-in user's interview history and reduces it to the summary the
 * passport and dashboard render. A failure is reported but still yields an empty
 * summary, so those pages degrade to their "no history yet" state rather than
 * breaking when the history endpoint is unavailable.
 */
export default function useProgress() {
  const [sessions, setSessions] = useState([])
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const history = await fetchSessions()
      setSessions(history)
      setSummary(summarizeSessions(history))
    } catch (cause) {
      setSessions([])
      setSummary(EMPTY_SUMMARY)
      setError(cause)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { sessions, summary, loading, error, reload: load }
}
