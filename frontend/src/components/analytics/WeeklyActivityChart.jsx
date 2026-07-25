import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { brandColors } from '../../theme.js'
import Panel from '../dashboard/Panel.jsx'

const weekday = (date) => date.toLocaleDateString([], { weekday: 'short' }).toUpperCase()

export default function WeeklyActivityChart({ practice }) {
  const bars = practice.map((day) => ({
    label: weekday(day.date),
    'Interview answers': day.interview,
    'Exchange sessions': day.exchange,
  }))

  const answers = practice.reduce((sum, day) => sum + day.interview, 0)
  const exchanges = practice.reduce((sum, day) => sum + day.exchange, 0)
  const minutes = practice.reduce((sum, day) => sum + day.minutes, 0)

  return (
    <Panel className="h-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-primary">Weekly Activity</h2>
          <p className="mt-1 text-xs text-primary/60">Every kind of practice, day by day</p>
        </div>
        <span className="text-xs font-semibold text-brand-blue">
          {answers} answer{answers === 1 ? '' : 's'} · {exchanges} exchange
          {exchanges === 1 ? '' : 's'}
          {minutes > 0 && ` · ${Math.round(minutes)} min`}
        </span>
      </div>

      {answers + exchanges === 0 ? (
        <p className="mt-6 text-sm text-primary/60">
          No practice logged this week. An interview answer or a language exchange both count.
        </p>
      ) : (
        <div className="mt-4 h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars} barCategoryGap="26%" margin={{ top: 4, left: -28, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: brandColors.primary, fontSize: 11, opacity: 0.55 }}
                stroke={brandColors.track}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: brandColors.primary, fontSize: 11, opacity: 0.55 }}
                stroke={brandColors.track}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: `1px solid ${brandColors.track}`,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
              <Bar
                dataKey="Interview answers"
                stackId="practice"
                fill={brandColors.brandBlue}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="Exchange sessions"
                stackId="practice"
                fill={brandColors.accent}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  )
}
