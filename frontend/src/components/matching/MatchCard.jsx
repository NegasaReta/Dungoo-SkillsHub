import { humanize } from '../../lib/labels.js'
import NavIcon from '../app/NavIcon.jsx'
import Panel from '../dashboard/Panel.jsx'

function ExchangeRow({ icon, label, languages, tone }) {
  if (!languages.length) return null

  return (
    <div className="flex items-start gap-2">
      <NavIcon name={icon} className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${tone}`} />
      <p className="text-xs text-primary/70">
        <span className="text-primary/50">{label} </span>
        {languages.map(humanize).join(', ')}
      </p>
    </div>
  )
}

export default function MatchCard({ match, onStart, disabled }) {
  return (
    <Panel spotlight lift className="sheen flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="relative">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10 text-sm font-semibold text-link">
            {match.initials}
          </span>
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-panel ${
              match.online ? 'bg-success' : 'bg-primary/25'
            }`}
            aria-label={match.online ? 'Online' : 'Offline'}
          />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
            {match.matchPercent}% Match
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              match.mutual ? 'bg-accent/20 text-primary' : 'bg-surface text-primary/60'
            }`}
          >
            {match.mutual ? 'Mutual exchange' : 'One-way'}
          </span>
        </div>
      </div>

      <h3 className="mt-4 text-base font-semibold text-primary">{match.name}</h3>
      <p className="mt-0.5 text-xs text-primary/55">{match.title}</p>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-primary/70">
        {match.lookingFor}
      </p>

      <div className="mt-4 space-y-1.5 rounded-lg bg-surface p-3">
        <ExchangeRow
          icon="arrow"
          label="Can teach you"
          languages={match.teaches}
          tone="text-link"
        />
        <ExchangeRow
          icon="arrow"
          label="Wants from you"
          languages={match.learns}
          tone="text-accent"
        />
      </div>

      <div className="mt-auto flex items-center gap-2 pt-5">
        <button
          type="button"
          onClick={() => onStart(match)}
          disabled={disabled}
          className="flex-1 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start 40-min session
        </button>
        <button
          type="button"
          aria-label={`Message ${match.name}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/15 text-primary/70 transition-colors hover:border-brand-blue/40 hover:text-link"
        >
          <NavIcon name="message" className="h-4 w-4" />
        </button>
      </div>
    </Panel>
  )
}
