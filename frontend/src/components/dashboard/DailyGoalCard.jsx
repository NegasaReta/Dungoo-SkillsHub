import { brandColors } from '../../theme.js'
import Panel from './Panel.jsx'

const RADIUS = 26
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function DailyGoalCard({ label, completed, target, unit }) {
  const ratio = target ? Math.min(completed / target, 1) : 0
  const percent = Math.round(ratio * 100)

  return (
    <Panel lift className="flex h-full items-center gap-4">
      <div className="relative shrink-0">
        <svg width="68" height="68" viewBox="0 0 68 68" aria-hidden="true" className="-rotate-90">
          <circle cx="34" cy="34" r={RADIUS} fill="none" stroke={brandColors.track} strokeWidth="6" />
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
        <p className="text-xs text-primary/60">{label}</p>
        <p className="mt-1 text-lg font-semibold text-primary">
          {completed} / {target}
        </p>
        <p className="text-xs text-primary/60">{unit}</p>
      </div>
    </Panel>
  )
}
