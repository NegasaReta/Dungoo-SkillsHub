import { useMemo, useState } from 'react'

import AppShell from '../components/app/AppShell.jsx'
import NavIcon from '../components/app/NavIcon.jsx'
import Panel from '../components/dashboard/Panel.jsx'
import InviteCard from '../components/matching/InviteCard.jsx'
import MatchCard from '../components/matching/MatchCard.jsx'
import MatchFilters from '../components/matching/MatchFilters.jsx'
import SessionPanel from '../components/matching/SessionPanel.jsx'
import { useUser } from '../context/UserContext.jsx'
import { EXCHANGE_LANGUAGES, PEERS } from '../data/matching.js'
import useExchangeSession from '../hooks/useExchangeSession.js'
import { DAILY_LIMIT_SECONDS, formatDuration } from '../lib/exchange.js'
import { rankPeers } from '../lib/matching.js'

/**
 * Seeds the pairing form from the profile, so nobody has to answer in two places:
 * languages the member speaks are what they can offer, and the ones they said they
 * want to practise are what they are looking for. Profiles saved before that second
 * field existed fall back to guessing from whatever they did not list.
 *
 * Narrowed to EXCHANGE_LANGUAGES because that is what the peer pool actually speaks —
 * a profile may well list languages no partner offers yet.
 */
function initialFilters(user) {
  const speaks = (user?.languages ?? []).filter((language) =>
    EXCHANGE_LANGUAGES.includes(language)
  )
  const wants = (user?.practising_languages ?? []).filter((language) =>
    EXCHANGE_LANGUAGES.includes(language)
  )
  const remaining = EXCHANGE_LANGUAGES.filter((language) => !speaks.includes(language))
  const guessed = remaining.includes('english') ? ['english'] : remaining.slice(0, 1)

  return {
    speaks: speaks.length ? speaks : ['amharic'],
    wants: wants.length ? wants : guessed,
    industry: 'any',
    level: 'any',
    onlineOnly: false,
  }
}

export default function Matching() {
  const { user } = useUser()
  const [filters, setFilters] = useState(() => initialFilters(user))
  const [view, setView] = useState('grid')
  const session = useExchangeSession()

  const matches = useMemo(() => rankPeers(PEERS, filters), [filters])
  const mutualCount = matches.filter((match) => match.mutual).length

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-link">
              Peer language exchange
            </p>
            <h1 className="mt-1 text-3xl font-bold text-primary">Find a practice partner</h1>
            <p className="mt-2 max-w-xl text-sm text-primary/60">
              Matched both ways across Amharic, Afaan Oromo, Tigrinya, and English — they teach
              what you want, you teach what they want.
            </p>
          </div>

          <Panel className="flex items-center gap-3 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-accent">
              <NavIcon name="clock" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary">
                {formatDuration(session.remaining)} left
              </p>
              <p className="text-[11px] text-primary/55">
                Free {DAILY_LIMIT_SECONDS / 60} min daily
              </p>
            </div>
          </Panel>
        </div>

        {session.peer && <SessionPanel session={session} />}

        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <MatchFilters filters={filters} onChange={setFilters} />
          </div>

          <div className="lg:col-span-9">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-primary">Your best matches</h2>
                <p className="mt-1 text-sm text-primary/60">
                  {matches.length
                    ? `${matches.length} partner${matches.length === 1 ? '' : 's'} found · ${mutualCount} mutual exchange${mutualCount === 1 ? '' : 's'}`
                    : 'No partners fit those languages yet.'}
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-primary/15 bg-panel p-1">
                <button
                  type="button"
                  aria-label="Grid view"
                  aria-pressed={view === 'grid'}
                  onClick={() => setView('grid')}
                  className={`rounded-md p-2 transition-colors ${
                    view === 'grid'
                      ? 'bg-brand-blue text-white'
                      : 'text-primary/50 hover:text-primary'
                  }`}
                >
                  <NavIcon name="grid" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={view === 'list'}
                  onClick={() => setView('list')}
                  className={`rounded-md p-2 transition-colors ${
                    view === 'list'
                      ? 'bg-brand-blue text-white'
                      : 'text-primary/50 hover:text-primary'
                  }`}
                >
                  <NavIcon name="list" className="h-4 w-4" />
                </button>
              </div>
            </div>

            {session.exhausted && (
              <Panel className="mt-5 border border-accent/30 bg-accent/10">
                <p className="text-sm text-primary/80">
                  You have used today&apos;s free {DAILY_LIMIT_SECONDS / 60} minutes. The allowance
                  resets tomorrow.
                </p>
              </Panel>
            )}

            <div
              className={`mt-5 grid gap-4 ${
                view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
              }`}
            >
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onStart={session.start}
                  disabled={session.exhausted || Boolean(session.peer)}
                />
              ))}
              <InviteCard />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
