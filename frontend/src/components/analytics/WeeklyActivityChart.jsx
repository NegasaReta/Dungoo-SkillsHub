import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts'

import { brandColors } from '../../theme.js'
import Panel from '../dashboard/Panel.jsx'

const WEEKDAY = (date) => date.toLocaleDateString([], { weekday: 'short' }).toUpperCase()

export default function WeeklyActivityChart({ activity }) {
  const bars = activity.map((entry) => ({
    label: WEEKDAY(entry.date),
    answers: entry.answers,
  }))
  const total = bars.reduce((sum, bar) => sum + bar.answers, 0)
  const peak = Math.max(...bars.map((bar) => bar.answers), 1)

  return (
    <Panel className="h-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-primary">Weekly Activity</h2>
          <p className="mt-1 text-xs text-primary/60">Answers scored each day</p>
        </div>
        <span className="text-xs font-semibold text-brand-blue">
          {total} answer{total === 1 ? '' : 's'} this week
        </span>
      </div>

      <div className="mt-6 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bars} barCategoryGap="26%" margin={{ top: 4, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: brandColors.primary, fontSize: 11, opacity: 0.55 }}
              stroke={brandColors.track}
            />
            <Bar dataKey="answers" radius={[6, 6, 0, 0]}>
              {bars.map((bar, index) => (
                <Cell
                  key={`${bar.label}-${index}`}
                  fill={bar.answers === peak && total ? brandColors.accent : brandColors.brandBlue}
                  fillOpacity={bar.answers === peak && total ? 1 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}
