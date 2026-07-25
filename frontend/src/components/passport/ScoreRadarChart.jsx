import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'

import { SCORE_MAX } from '../../constants.js'
import { strings } from '../../i18n/en.js'
import { isScored } from '../../lib/scores.js'
import { brandColors } from '../../theme.js'
import Panel from '../dashboard/Panel.jsx'

export default function ScoreRadarChart({ scores = {} }) {
  const t = strings.passport
  const data = Object.entries(t.skills).map(([skill, label]) => ({
    label,
    value: scores[skill] ?? 0,
  }))
  const anyScored = data.some((point) => isScored(point.value))

  return (
    <Panel className="h-full">
      <h3 className="text-base font-semibold text-primary">{t.shapeTitle}</h3>

      {anyScored ? (
        <div className="mt-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="72%">
              <PolarGrid stroke={brandColors.primary} strokeOpacity={0.12} />
              <PolarAngleAxis
                dataKey="label"
                tick={{ fill: brandColors.primary, fontSize: 12 }}
              />
              {/* The rubric floor is 1, but the axis starts at 0 so a weak score
                  still reads as a small shape rather than an empty chart. */}
              <PolarRadiusAxis domain={[0, SCORE_MAX]} tickCount={SCORE_MAX + 1} tick={false} axisLine={false} />
              <Radar
                dataKey="value"
                stroke={brandColors.brandBlue}
                fill={brandColors.brandBlue}
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-4 text-sm text-primary/50">{t.notScored}</p>
      )}
    </Panel>
  )
}
