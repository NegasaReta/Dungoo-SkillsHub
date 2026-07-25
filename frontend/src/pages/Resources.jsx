import { useMemo, useState } from 'react'

import AppShell from '../components/app/AppShell.jsx'
import NavIcon from '../components/app/NavIcon.jsx'
import Panel from '../components/dashboard/Panel.jsx'
import FeaturedResource from '../components/resources/FeaturedResource.jsx'
import ResourceCard from '../components/resources/ResourceCard.jsx'
import ResourceReader from '../components/resources/ResourceReader.jsx'
import StartHereCard from '../components/resources/StartHereCard.jsx'
import TopicTabs from '../components/resources/TopicTabs.jsx'
import {
  RESOURCES,
  TOPICS,
  featuredResource,
  filterResources,
  recommendResources,
} from '../data/resources.js'
import useProgress from '../hooks/useProgress.js'
import { format, strings } from '../i18n/en.js'

const copy = strings.resources

export default function Resources() {
  const { summary } = useProgress()
  const [topic, setTopic] = useState('all')
  const [query, setQuery] = useState('')
  const [reading, setReading] = useState(null)

  const featured = featuredResource()
  const filtered = useMemo(() => filterResources(RESOURCES, { topic, query }), [topic, query])

  // The featured guide has its own panel, so it is not repeated in the grid unless a
  // search or topic filter is what surfaced it.
  const untouched = topic === 'all' && !query.trim()
  const grid = untouched ? filtered.filter((resource) => resource !== featured) : filtered

  const counts = useMemo(
    () =>
      Object.fromEntries(
        TOPICS.map(({ slug }) => [slug, filterResources(RESOURCES, { topic: slug, query }).length])
      ),
    [query]
  )

  const recommended = useMemo(
    () => recommendResources(RESOURCES, summary.hasHistory ? summary.weakest.label : null),
    [summary]
  )

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-blue">
              {copy.eyebrow}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-primary">{copy.title}</h1>
            <p className="mt-2 max-w-xl text-sm text-primary/60">{copy.subtitle}</p>
          </div>

          <label className="relative w-full max-w-xs">
            <span className="sr-only">{copy.searchLabel}</span>
            <NavIcon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-lg border border-primary/15 bg-surface py-2.5 pl-9 pr-3 text-sm text-primary outline-none transition-colors placeholder:text-primary/40 focus:border-brand-blue focus:bg-panel"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <TopicTabs topic={topic} onChange={setTopic} counts={counts} />
          <p className="text-xs text-primary/50">
            {format(filtered.length === 1 ? copy.resultCount : copy.resultCountPlural, {
              count: filtered.length,
            })}
          </p>
        </div>

        {untouched && (
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <FeaturedResource resource={featured} onOpen={setReading} />
            </div>
            <div className="lg:col-span-4">
              <StartHereCard
                resources={recommended}
                weakestAxis={summary.hasHistory ? summary.weakest.label : null}
                hasScores={summary.hasHistory}
                onOpen={setReading}
              />
            </div>
          </div>
        )}

        {grid.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {grid.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} onOpen={setReading} />
            ))}
          </div>
        ) : (
          <Panel className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
              <NavIcon name="search" className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-primary">{copy.empty}</h2>
            <p className="mt-1 text-sm text-primary/60">{copy.emptyHint}</p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setTopic('all')
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-primary/15 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
            >
              {copy.clearFilters}
            </button>
          </Panel>
        )}
      </div>

      <ResourceReader resource={reading} onClose={() => setReading(null)} />
    </AppShell>
  )
}
