import Card from '../common/Card.jsx'

export default function ProgressSummary({ sessionsCompleted = 0, averageScore = 0 }) {
  return (
    <Card className="flex gap-8">
      <div>
        <p className="text-sm text-slate-500">Sessions</p>
        <p className="text-2xl font-semibold">{sessionsCompleted}</p>
      </div>
      <div>
        <p className="text-sm text-slate-500">Average score</p>
        <p className="text-2xl font-semibold">{averageScore.toFixed(1)}</p>
      </div>
    </Card>
  )
}
