import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { SCORE_MAX } from '../../constants.js'
import { brandColors } from '../../theme.js'
import Panel from '../dashboard/Panel.jsx'

const SERIES = [
  { key: 'average', label: 'Overall', color: brandColors.brandBlue },
  { key: 'clarity', label: 'Clarity', color: brandColors.accent },
  { key: 'confidence', label: 'Confidence', color: brandColors.success },
  { key: 'star', label: 'STAR', color: brandColors.primary },
]

const shortDate = (date) => date.toLocaleDateString([], { day: 'numeric', month: 'short' })

export default function ScoreHistoryChart({ activity }) {
  const [visible, setVisible] = useState(['average'])

  const points = activity.map((entry) => ({
    label: shortDate(entry.date),
    average: entry.average,
    clarity: entry.clarity,
    confidence: entry.confidence,
    star: entry.star,
  }))
  const scoredDays = points.filter((point) => point.average !== null).length

  // Overall alone is the default view; the axes are opt-in so the chart stays readable.
  function toggle(key) {
    setVisible((current) => {
      if (!current.includes(key)) return [...current, key]
      // Never let the last series be switched off, which would blank the chart.
      return current.length === 1 ? current : current.filter((item) => item !== key)
    })
  }

  return (
    <Panel className="h-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-primary">Score History</h2>
          <p className="mt-1 text-xs text-primary/60">
            {scoredDays} day{scoredDays === 1 ? '' : 's'} with scored answers in this range
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 print:hidden">
          {SERIES.map((series) => {
            const active = visible.includes(series.key)
            return (
              <button
                key={series.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(series.key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
                  active
                    ? 'border-primary/20 bg-surface text-primary'
                    : 'border-primary/10 text-primary/45 hover:text-primary/70'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: active ? series.color : 'currentColor' }}
                />
                {series.label}
              </button>
            )
          })}
        </div>
      </div>

      {scoredDays ? (
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
              <CartesianGrid stroke={brandColors.track} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: brandColors.primary, fontSize: 11, opacity: 0.55 }}
                stroke={brandColors.track}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                domain={[0, SCORE_MAX]}
                tickCount={SCORE_MAX + 1}
                tick={{ fill: brandColors.primary, fontSize: 11, opacity: 0.55 }}
                stroke={brandColors.track}
              />
              <Tooltip
                formatter={(value, name) => [`${value} / ${SCORE_MAX}`, name]}
                contentStyle={{
                  borderRadius: 10,
                  border: `1px solid ${brandColors.track}`,
                  fontSize: 12,
                }}
              />
              {SERIES.filter((series) => visible.includes(series.key)).map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.label}
                  stroke={series.color}
                  strokeWidth={series.key === 'average' ? 2.5 : 1.5}
                  dot={{ r: 2.5, strokeWidth: 0, fill: series.color }}
                  activeDot={{ r: 5 }}
                  // Practice is not daily, so gaps are bridged rather than read as zero.
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-6 text-sm text-primary/60">
          No answers scored in this range. Try a longer range, or finish a mock interview to start
          the trend.
        </p>
      )}
    </Panel>
  )
}
