import { useCallback, useEffect, useMemo, useState } from 'react'

import { fetchSessions, usingMockApi } from '../api/index.js'
import { useUser } from '../context/UserContext.jsx'
import { EMPTY_PRACTICE, practiceSummary, toEvents } from '../lib/activity.js'
import { readDemoSessions } from '../lib/demoData.js'
import { readExchangeSessions } from '../lib/exchange.js'
import { EMPTY_SUMMARY, summarizeSessions } from '../lib/progress.js'

/**
 * Loads every kind of practice history and reduces it for the pages that report on
 * progress. Interview sessions come from the API; peer exchange sessions are local
 * to the FR-2 mockup. A failure on either side is reported but still yields empty
 * summaries, so those pages degrade to their "no history yet" state rather than
 * breaking.
 */
/**
 * Sample history lives in the browser, so the real API never returns it and it has
 * to be overlaid. The mock reads from the same store fetchSessions does, which
 * would otherwise double every seeded row.
 */
function demoHistory(userId) {
  return usingMockApi || !userId ? [] : readDemoSessions(userId)
}

const byDate = (a, b) => a.created_at.localeCompare(b.created_at)

export default function useProgress() {
  const { user } = useUser()
  const [sessions, setSessions] = useState([])
  const [exchanges, setExchanges] = useState([])
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    setExchanges(readExchangeSessions())

    const demo = demoHistory(user?.id)

    try {
      const history = [...demo, ...(await fetchSessions())].sort(byDate)
      setSessions(history)
      setSummary(summarizeSessions(history))
    } catch (cause) {
      // The history route is still pending on the backend, so this path is the
      // normal one against the real API. Seeded history must survive it.
      setSessions(demo)
      setSummary(demo.length ? summarizeSessions(demo) : EMPTY_SUMMARY)
      setError(cause)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

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
