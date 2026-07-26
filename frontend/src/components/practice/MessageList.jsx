import NavIcon from '../app/NavIcon.jsx'
import CorrectedMessage from './CorrectedMessage.jsx'

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-primary/15 bg-surface px-5 py-10 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
        <NavIcon name="message" className="h-6 w-6" />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-primary">Start with a sentence or two</h3>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-primary/55">
        Write about your work the way you would in an email or a meeting. Corrections come back
        highlighted in place, with the reason behind each one.
      </p>
    </div>
  )
}

export default function MessageList({ turns }) {
  if (!turns.length) return <EmptyState />

  return (
    <ul className="space-y-4">
      {turns.map((turn) => (
        <li key={turn.id} className={turn.role === 'user' ? 'flex justify-end' : ''}>
          {turn.role === 'user' ? (
            <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand-blue px-4 py-2.5 text-sm leading-relaxed text-white">
              {turn.content}
            </p>
          ) : (
            <div className="rounded-2xl rounded-bl-sm border border-primary/10 bg-surface px-4 py-3">
              <CorrectedMessage
                corrected={turn.coaching.corrected_text}
                errors={turn.coaching.errors}
                followUp={turn.coaching.follow_up}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
