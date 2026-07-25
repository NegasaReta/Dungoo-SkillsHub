import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'

import { brandColors } from '../../theme.js'

export default function ScoreRadarChart({ scores = {} }) {
  const data = Object.entries(scores).map(([skill, value]) => ({ skill, value }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid stroke={brandColors.primary} strokeOpacity={0.15} />
        <PolarAngleAxis dataKey="skill" tick={{ fill: brandColors.primary, fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 5]} tick={{ fill: brandColors.primary, fontSize: 10 }} />
        <Radar
          dataKey="value"
          stroke={brandColors.brandBlue}
          fill={brandColors.brandBlue}
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
