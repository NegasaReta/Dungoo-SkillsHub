import { Bar, BarChart, Cell, ResponsiveContainer } from 'recharts'

import { brandColors } from '../../theme.js'
import Panel from './Panel.jsx'

export default function LearningGrowthCard({ data }) {
  const peak = Math.max(...data.map((point) => point.value), 1)

  return (
    <Panel className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-primary">Learning Growth</h2>
          <p className="mt-1 text-xs text-primary/60">
            Average interview score per session, oldest to newest
          </p>
        </div>
        <span className="rounded-full border border-primary/15 px-2.5 py-1 text-[11px] text-primary/60">
          {data.length} session{data.length === 1 ? '' : 's'}
        </span>
      </div>

      {data.length ? (
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
      ) : (
        <p className="mt-6 text-sm text-primary/60">
          Finish a mock interview and your score trend appears here.
        </p>
      )}
    </Panel>
  )
}
