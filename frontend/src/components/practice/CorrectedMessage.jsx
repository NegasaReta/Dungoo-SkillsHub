import { useMemo, useState } from 'react'

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
      <span className="line-through">{error.original}</span>{' '}
      <span className="font-medium">{error.fix}</span>
      {error.explanation ? ` — ${error.explanation}` : null}
    </>
  )
}

export default function CorrectedMessage({ corrected, errors = [], followUp }) {
  const [openIndex, setOpenIndex] = useState(null)
  const { segments, unmatched } = useMemo(() => buildSegments(corrected, errors), [corrected, errors])
  const openError = openIndex === null ? null : errors[openIndex]

  return (
    <div>
      <p className="leading-relaxed text-slate-900">
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
              className="rounded bg-amber-100 underline decoration-amber-500 decoration-dotted underline-offset-2"
            >
              {segment.text}
            </button>
          ),
        )}
      </p>

      {openError ? (
        <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-slate-700">
          <CorrectionDetail error={openError} />
        </p>
      ) : null}

      {errors.length === 0 ? (
        <p className="mt-2 text-sm text-emerald-700">No corrections — that reads well.</p>
      ) : null}

      {unmatched.length > 0 ? (
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {unmatched.map((error) => (
            <li key={error.index}>
              <CorrectionDetail error={error} />
            </li>
          ))}
        </ul>
      ) : null}

      {followUp ? <p className="mt-3 text-slate-900">{followUp}</p> : null}
    </div>
  )
}
