import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchPassport } from '../../api/passport.js'
import AppShell from '../app/AppShell.jsx'
import Button from '../common/Button.jsx'
import Loader from '../common/Loader.jsx'
import Panel from '../dashboard/Panel.jsx'
import EmptyPassport from './EmptyPassport.jsx'
import PassportView from './PassportView.jsx'
import { strings } from '../../i18n/en.js'

function ErrorPanel({ message, onRetry }) {
  const t = strings.passport

  return (
    <Panel className="border-accent/40 bg-accent/10">
      <h2 className="font-semibold text-primary">{t.errorTitle}</h2>
      <p className="mt-1 whitespace-pre-line text-sm text-primary/70">{message}</p>
      <Button variant="outline" className="mt-4" onClick={onRetry}>
        {t.retry}
      </Button>
    </Panel>
  )
}

export default function ApiPassport() {
  const t = strings.passport
  const [passport, setPassport] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchPassport()
      .then((data) => {
        if (!cancelled) setPassport(data)
      })
      .catch((cause) => {
        if (!cancelled) setError(cause)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  const hasSessions = Boolean(passport?.sessions_completed)

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-primary">{t.title}</h1>
            <p className="mt-1 text-sm text-primary/60">{t.subtitle}</p>
          </div>
          {hasSessions && (
            <Button as={Link} to="/interview" variant="outline">
              {t.practiseAgain}
            </Button>
          )}
        </header>

        {loading && (
          <Panel>
            <Loader label={t.loading} />
          </Panel>
        )}

        {!loading && error && (
          <ErrorPanel
            message={error.message ?? String(error)}
            onRetry={() => setAttempt((count) => count + 1)}
          />
        )}

        {!loading && !error && passport && (
          hasSessions ? <PassportView passport={passport} /> : <EmptyPassport />
        )}
      </div>
    </AppShell>
  )
}
