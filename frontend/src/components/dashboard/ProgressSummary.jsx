import Card from '../common/Card.jsx'

export default function ProgressSummary({ sessionsCompleted = 0, averageScore = 0 }) {
  return (
    <Card className="flex gap-8">
      <div>
        <p className="text-sm text-primary/60">Sessions</p>
        <p className="text-2xl font-semibold text-primary">{sessionsCompleted}</p>
      </div>
      <div>
        <p className="text-sm text-primary/60">Average score</p>
        <p className="text-2xl font-semibold text-accent">{averageScore.toFixed(1)}</p>
      </div>
    </Card>
  )
}
