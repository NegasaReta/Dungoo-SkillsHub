import { averageScore, topSkill } from '../../lib/progress.js'
import Panel from '../dashboard/Panel.jsx'
import ScoreRadarChart from './ScoreRadarChart.jsx'

export default function SkillsProficiency({ scores, hasHistory = true }) {
  const average = averageScore(scores)
  const top = hasHistory ? topSkill(scores) : '—'

  return (
    <Panel className="h-full">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/45">
        Skills proficiency
      </p>

      <div className="mt-2">
        <ScoreRadarChart scores={scores} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3 border-t border-primary/10 pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-primary/45">Average score</p>
          <p className="mt-1 text-lg font-semibold text-primary">
            {average.toFixed(1)} <span className="text-sm font-normal text-primary/50">/ 5</span>
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-primary/45">Top skill</p>
          <p className="mt-1 text-lg font-semibold text-brand-blue">{top}</p>
        </div>
      </div>
    </Panel>
  )
}
