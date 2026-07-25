import { useCallback, useEffect, useMemo, useState } from 'react'

import { fetchSessions } from '../api/index.js'
import { EMPTY_PRACTICE, practiceSummary, toEvents } from '../lib/activity.js'
import { readExchangeSessions } from '../lib/exchange.js'
import { EMPTY_SUMMARY, summarizeSessions } from '../lib/progress.js'

/**
 * Loads every kind of practice history and reduces it for the pages that report on
 * progress. Interview sessions come from the API; peer exchange sessions are local
 * to the FR-2 mockup. A failure on either side is reported but still yields empty
 * summaries, so those pages degrade to their "no history yet" state rather than
 * breaking.
 */
export default function useProgress() {
  const [sessions, setSessions] = useState([])
  const [exchanges, setExchanges] = useState([])
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    setExchanges(readExchangeSessions())

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

  const events = useMemo(() => toEvents({ interviews: sessions, exchanges }), [sessions, exchanges])
  const practice = useMemo(
    () => (events.length ? practiceSummary(events) : EMPTY_PRACTICE),
    [events]
  )

  return { sessions, exchanges, events, summary, practice, loading, error, reload: load }
}
