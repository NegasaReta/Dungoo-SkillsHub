import NavIcon from '../app/NavIcon.jsx'
import Panel from '../dashboard/Panel.jsx'

/**
 * What the practice time was actually spent on. Progress is more than interviews,
 * so this is the panel that proves the other activities count.
 */
export default function ActivityMix({ practice }) {
  const total = practice.totalEvents || 1

  return (
    <Panel className="h-full">
      <h2 className="text-base font-semibold text-primary">Practice Mix</h2>
      <p className="mt-1 text-xs text-primary/60">
        {practice.totalEvents} activit{practice.totalEvents === 1 ? 'y' : 'ies'} across{' '}
        {practice.activeDays} day{practice.activeDays === 1 ? '' : 's'}
      </p>

      <ul className="mt-5 space-y-4">
        {practice.mix.map((entry) => (
          <li key={entry.key}>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                <NavIcon name={entry.icon} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium text-primary">{entry.label}</p>
                  <span className="text-sm font-semibold text-primary">{entry.count}</span>
                </div>
                <p className="text-xs text-primary/55">{entry.detail}</p>
              </div>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-track">
              <div
                className={`h-full rounded-full ${
                  entry.timed ? 'bg-accent' : 'bg-brand-blue'
                }`}
                style={{ width: `${Math.round((entry.count / total) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {practice.minutes > 0 && (
        <p className="mt-5 rounded-lg bg-surface px-3 py-2 text-xs text-primary/60">
          {Math.round(practice.minutes)} minutes of timed practice recorded. Interview answers are
          counted, not timed — the recorder does not store answer length yet.
        </p>
      )}
    </Panel>
  )
}
