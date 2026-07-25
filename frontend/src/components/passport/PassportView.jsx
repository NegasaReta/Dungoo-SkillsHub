import Card from '../common/Card.jsx'
import ScoreRadarChart from './ScoreRadarChart.jsx'

export default function PassportView({ passport }) {
  if (!passport) return null

  return (
    <Card>
      <h2 className="text-lg font-medium">{passport.role}</h2>
      <ScoreRadarChart scores={passport.scores} />
    </Card>
  )
}
