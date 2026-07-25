import { SCORE_MAX } from '../../constants.js'
import { format, strings } from '../../i18n/en.js'
import { formatDate } from '../../lib/dates.js'
import { formatScore, isScored } from '../../lib/scores.js'
import Panel from '../dashboard/Panel.jsx'

/**
 * The API sends history oldest first so a chart can plot it directly. Here the
 * newest session leads, with the change from the session before it — the passport
 * is meant to show movement, not just a final number.
 */
function withChange(history) {
  return history
    .map((entry, index) => ({
      ...entry,
      change: index === 0 ? null : Number((entry.overall - history[index - 1].overall).toFixed(1)),
    }))
    .reverse()
}

function Change({ value }) {
  if (!value) return null

  const improved = value > 0
  return (
    <span className={`text-xs font-medium ${improved ? 'text-success' : 'text-primary/40'}`}>
      {improved ? '+' : ''}
      {value.toFixed(1)}
    </span>
  )
}

export default function SessionHistory({ history = [] }) {
  const t = strings.passport
  const entries = withChange(history)

  return (
    <Panel>
      <h3 className="text-base font-semibold text-primary">{t.historyTitle}</h3>
      <ul className="mt-4 divide-y divide-primary/5">
        {entries.map((entry) => (
          <li key={entry.session_id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-primary">{entry.role_label}</p>
              <p className="mt-0.5 text-xs text-primary/50">
                {formatDate(entry.completed_at)}
                {' · '}
                {format(t.historyAnswers, { count: entry.answers_scored })}
              </p>
            </div>
            <div className="flex shrink-0 items-baseline gap-2">
              <Change value={entry.change} />
              <span className="text-sm font-semibold text-primary">
                {formatScore(entry.overall)}
                <span className="font-normal text-primary/40">
                  {isScored(entry.overall) ? ` / ${SCORE_MAX}` : ''}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
