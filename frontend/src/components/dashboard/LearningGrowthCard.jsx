import { Bar, BarChart, Cell, ResponsiveContainer } from 'recharts'

import { brandColors } from '../../theme.js'
import Panel from './Panel.jsx'

export default function LearningGrowthCard({ data }) {
  const peak = Math.max(...data.map((point) => point.value))

  return (
    <Panel className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-primary">Learning Growth</h2>
          <p className="mt-1 text-xs text-primary/60">
            Skill mastery progress over the last 30 days
          </p>
        </div>
        <span className="rounded-full border border-primary/15 px-2.5 py-1 text-[11px] text-primary/60">
          Last 30 Days
        </span>
      </div>

      <div className="mt-6 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="22%">
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((point) => (
                <Cell
                  key={point.day}
                  // Taller bars read stronger, matching the design's emphasis on recent growth.
                  fill={point.value === peak ? brandColors.accent : brandColors.brandBlue}
                  fillOpacity={point.value === peak ? 1 : 0.25 + (point.value / peak) * 0.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}
