import Card from '../common/Card.jsx'
import CorrectedMessage from './CorrectedMessage.jsx'

export default function MessageList({ turns }) {
  if (!turns.length) {
    return (
      <p className="text-sm text-slate-500">
        Write a few sentences about your work and the coach will correct them.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {turns.map((turn) => (
        <li key={turn.id} className={turn.role === 'user' ? 'flex justify-end' : ''}>
          {turn.role === 'user' ? (
            <p className="max-w-[80%] rounded-xl bg-slate-900 px-3 py-2 text-white">
              {turn.content}
            </p>
          ) : (
            <Card>
              <CorrectedMessage
                corrected={turn.coaching.corrected_text}
                errors={turn.coaching.errors}
                followUp={turn.coaching.follow_up}
              />
            </Card>
          )}
        </li>
      ))}
    </ul>
  )
}
