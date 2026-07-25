import Card from '../common/Card.jsx'
import { format, strings } from '../../i18n/en.js'

export default function QuestionCard({ index, total, question }) {
  const t = strings.interview

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-primary/60">
          {format(t.questionProgress, { current: index + 1, total })}
        </p>
        {question?.competency && (
          <span className="rounded-full bg-brand-blue/10 px-2.5 py-1 text-xs font-medium text-brand-blue">
            {question.competency}
          </span>
        )}
      </div>
      <p className="mt-3 text-lg text-primary">{question?.text}</p>
    </Card>
  )
}
