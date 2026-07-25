import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'

export default function ScoreRadarChart({ scores = {} }) {
  const data = Object.entries(scores).map(([skill, value]) => ({ skill, value }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis domain={[0, 10]} />
        <Radar dataKey="value" stroke="#0f172a" fill="#0f172a" fillOpacity={0.3} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
