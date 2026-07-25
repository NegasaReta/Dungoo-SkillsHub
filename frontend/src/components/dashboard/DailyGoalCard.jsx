import { brandColors } from '../../theme.js'
import Panel from './Panel.jsx'

const RADIUS = 26
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function DailyGoalCard({ completedMinutes, targetMinutes }) {
  const ratio = targetMinutes ? Math.min(completedMinutes / targetMinutes, 1) : 0
  const percent = Math.round(ratio * 100)

  return (
    <Panel className="flex h-full items-center gap-4">
      <div className="relative shrink-0">
        <svg width="68" height="68" viewBox="0 0 68 68" aria-hidden="true" className="-rotate-90">
          <circle cx="34" cy="34" r={RADIUS} fill="none" stroke="#E2E8F2" strokeWidth="6" />
          <circle
            cx="34"
            cy="34"
            r={RADIUS}
            fill="none"
            stroke={brandColors.brandBlue}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-primary">
          {percent}%
        </span>
      </div>

      <div>
        <p className="text-xs text-primary/60">Daily Goal</p>
        <p className="mt-1 text-lg font-semibold text-primary">
          {completedMinutes} / {targetMinutes}
        </p>
        <p className="text-xs text-primary/60">Min</p>
      </div>
    </Panel>
  )
}
