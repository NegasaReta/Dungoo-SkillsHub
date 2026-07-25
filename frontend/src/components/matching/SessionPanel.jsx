import { DAILY_LIMIT_SECONDS, formatDuration } from '../../lib/exchange.js'
import { humanize } from '../../lib/labels.js'
import NavIcon from '../app/NavIcon.jsx'
import Panel from '../dashboard/Panel.jsx'

export default function SessionPanel({ session }) {
  const { peer, running, remaining, usedSeconds, exhausted, pause, resume, end } = session
  const ratio = remaining / DAILY_LIMIT_SECONDS

  return (
    <Panel spotlight className="relative overflow-hidden border border-brand-blue/20 bg-brand-blue/5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue text-sm font-semibold text-white">
            {peer.initials}
          </span>
          <div>
            <p className="text-sm font-semibold text-primary">
              Exchange with {peer.name}
            </p>
            <p className="text-xs text-primary/60">
              You practise {peer.teaches.map(humanize).join(', ') || '—'} · they practise{' '}
              {peer.learns.map(humanize).join(', ') || '—'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-mono text-2xl font-bold text-primary">{formatDuration(remaining)}</p>
          <p className="text-[11px] uppercase tracking-wide text-primary/50">
            {exhausted ? 'Daily allowance used' : 'Free time left today'}
          </p>
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-linear"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-primary/60">
          {formatDuration(usedSeconds)} of {DAILY_LIMIT_SECONDS / 60} minutes used today. Audio and
          video calling arrives after the hackathon build.
        </p>

        <div className="flex gap-2">
          {!exhausted && (
            <button
              type="button"
              onClick={running ? pause : resume}
              className="rounded-lg border border-primary/15 bg-panel px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface"
            >
              {running ? 'Pause' : 'Resume'}
            </button>
          )}
          <button
            type="button"
            onClick={end}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy/90"
          >
            <NavIcon name="close" className="h-4 w-4" />
            End session
          </button>
        </div>
      </div>
    </Panel>
  )
}
