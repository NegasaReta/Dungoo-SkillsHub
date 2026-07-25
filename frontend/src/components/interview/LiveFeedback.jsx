import Card from '../common/Card.jsx'
import ScoreBar from './ScoreBar.jsx'
import { strings } from '../../i18n/en.js'

export default function LiveFeedback({ feedback }) {
  if (!feedback) return null

  const t = strings.interview
  const axes = [
    { label: t.scoreClarity, value: feedback.clarity_score },
    { label: t.scoreConfidence, value: feedback.confidence_score },
    { label: t.scoreStar, value: feedback.star_score },
  ]

  return (
    <Card>
      <h2 className="text-lg font-semibold text-primary">{t.feedbackTitle}</h2>

      <div className="mt-5 space-y-4">
        {axes.map((axis) => (
          <ScoreBar key={axis.label} label={axis.label} value={axis.value ?? 0} />
        ))}
      </div>

      {feedback.summary && <p className="mt-5 text-primary/70">{feedback.summary}</p>}

      {feedback.strengths?.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-primary">{t.strengths}</h3>
          <ul className="mt-2 space-y-1.5">
            {feedback.strengths.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-primary/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.improvements?.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-primary">{t.improvements}</h3>
          <ul className="mt-2 space-y-1.5">
            {feedback.improvements.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-primary/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
