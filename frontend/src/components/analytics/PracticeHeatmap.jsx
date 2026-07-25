import { activityLevel, activityWeeks } from '../../lib/progress.js'
import Panel from '../dashboard/Panel.jsx'

// Indexed by activity level so Tailwind keeps every class in the build.
const LEVEL_STYLES = [
  'bg-primary/10',
  'bg-success/30',
  'bg-success/50',
  'bg-success/75',
  'bg-success',
]

function summaryFor(day) {
  const parts = []
  if (day.interview) parts.push(`${day.interview} answer${day.interview === 1 ? '' : 's'}`)
  if (day.exchange) parts.push(`${day.exchange} exchange${day.exchange === 1 ? '' : 's'}`)

  const when = day.date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  return `${when} — ${parts.length ? parts.join(', ') : 'no practice'}`
}

export default function PracticeHeatmap({ practice, streakDays }) {
  const activeDays = practice.filter((day) => day.events > 0).length

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-primary">Practice Streak</h2>
          <p className="mt-1 text-xs text-primary/60">
            {activeDays} active day{activeDays === 1 ? '' : 's'} in the last quarter · current
            streak {streakDays} day{streakDays === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-primary/50">
          Less
          {LEVEL_STYLES.map((style, index) => (
            <span key={index} className={`h-3 w-3 rounded-sm ${style}`} />
          ))}
          More
        </div>
      </div>

      <div className="mt-5 overflow-x-auto pb-1">
        <div
          role="img"
          aria-label={`Daily practice over the last ${practice.length} days: ${activeDays} active days`}
          className="flex gap-1"
        >
          {activityWeeks(practice).map((week, index) => (
            <div key={index} className="flex flex-col gap-1">
              {week.map((day) => (
                <span
                  key={day.date.toISOString()}
                  title={summaryFor(day)}
                  className={`h-3.5 w-3.5 rounded-sm ${LEVEL_STYLES[activityLevel(day.events)]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}
