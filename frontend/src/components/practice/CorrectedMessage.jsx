import { useMemo, useState } from 'react'

import NavIcon from '../app/NavIcon.jsx'

/** First offset of `fix` in `text` that no earlier highlight already claimed. */
function locate(text, fix, taken) {
  let from = 0
  while (from <= text.length) {
    const start = text.indexOf(fix, from)
    if (start === -1) return -1
    const end = start + fix.length
    if (!taken.some((span) => start < span.end && end > span.start)) return start
    from = start + 1
  }
  return -1
}

/**
 * Split the corrected text into plain and highlighted runs.
 *
 * The coach reports each error as original -> fix, but the text being rendered is the
 * corrected one, so highlights are anchored on `fix`. Anything that cannot be found is
 * returned as `unmatched` and listed separately rather than dropped.
 */
function buildSegments(text, errors) {
  const spans = []
  const unmatched = []

  errors.forEach((error, index) => {
    const start = error.fix ? locate(text, error.fix, spans) : -1
    if (start === -1) {
      unmatched.push({ ...error, index })
      return
    }
    spans.push({ start, end: start + error.fix.length, index })
  })

  spans.sort((a, b) => a.start - b.start)

  const segments = []
  let cursor = 0
  spans.forEach((span) => {
    if (span.start > cursor) segments.push({ text: text.slice(cursor, span.start) })
    segments.push({ text: text.slice(span.start, span.end), index: span.index })
    cursor = span.end
  })
  if (cursor < text.length) segments.push({ text: text.slice(cursor) })

  return { segments, unmatched }
}

function CorrectionDetail({ error }) {
  return (
    <>
      <span className="text-primary/50 line-through">{error.original}</span>{' '}
      <span className="font-semibold text-primary">{error.fix}</span>
      {error.explanation ? <span className="text-primary/70"> — {error.explanation}</span> : null}
    </>
  )
}

export default function CorrectedMessage({ corrected, errors = [], followUp }) {
  const [openIndex, setOpenIndex] = useState(null)
  const { segments, unmatched } = useMemo(() => buildSegments(corrected, errors), [corrected, errors])
  const openError = openIndex === null ? null : errors[openIndex]

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/40">
        {errors.length > 0 ? 'Corrected' : 'Your sentence'}
      </p>

      <p className="mt-1.5 text-sm leading-relaxed text-primary">
        {segments.map((segment, position) =>
          segment.index === undefined ? (
            <span key={position}>{segment.text}</span>
          ) : (
            <button
              key={position}
              type="button"
              title={`${errors[segment.index].fix} — ${errors[segment.index].explanation}`}
              aria-expanded={openIndex === segment.index}
              onClick={() => setOpenIndex(openIndex === segment.index ? null : segment.index)}
              className="rounded bg-accent/25 underline decoration-accent decoration-dotted decoration-2 underline-offset-2 transition-colors hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            >
              {segment.text}
            </button>
          ),
        )}
      </p>

      {openError ? (
        <p className="mt-2.5 rounded-lg border border-accent/30 bg-accent/10 p-2.5 text-xs leading-relaxed">
          <CorrectionDetail error={openError} />
        </p>
      ) : null}

      {errors.length === 0 ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-success">
          <NavIcon name="check" className="h-3.5 w-3.5" />
          No corrections — that reads well.
        </p>
      ) : null}

      {unmatched.length > 0 ? (
        <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed">
          {unmatched.map((error) => (
            <li key={error.index} className="border-l-2 border-accent/40 pl-2.5">
              <CorrectionDetail error={error} />
            </li>
          ))}
        </ul>
      ) : null}

      {followUp ? (
        <p className="mt-3 border-t border-primary/10 pt-3 text-sm leading-relaxed text-primary">
          {followUp}
        </p>
      ) : null}
    </div>
  )
}
