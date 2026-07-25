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

const shortDate = (date) => date.toLocaleDateString([], { day: 'numeric', month: 'short' })

export default function ScoreHistoryChart({ activity, rangeDays, onRangeChange }) {
  const points = activity.map((entry) => ({
    label: shortDate(entry.date),
    average: entry.average,
  }))
  const scoredDays = points.filter((point) => point.average !== null).length

  return (
    <Panel className="h-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-primary">AI Score History</h2>
          <p className="mt-1 text-xs text-primary/60">
            Daily average across clarity, confidence, and STAR
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs text-primary/60">
          <span className="sr-only">Score history range</span>
          <select
            value={rangeDays}
            onChange={(event) => onRangeChange(Number(event.target.value))}
            className="rounded-lg border border-primary/15 bg-surface px-2.5 py-1.5 text-xs text-primary outline-none focus:border-brand-blue"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </label>
      </div>

      {scoredDays ? (
        <div className="mt-6 h-56">
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
                formatter={(value) => [`${value} / ${SCORE_MAX}`, 'Average']}
                contentStyle={{
                  borderRadius: 10,
                  border: `1px solid ${brandColors.track}`,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke={brandColors.brandBlue}
                strokeWidth={2}
                dot={{ r: 3, fill: brandColors.accent, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                // Practice is not daily, so gaps are bridged rather than read as zero.
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-6 text-sm text-primary/60">
          No answers scored in this window. Finish a mock interview to start the trend.
        </p>
      )}
    </Panel>
  )
}
