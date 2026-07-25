import { SCORE_MAX } from '../../constants.js'
import { strings } from '../../i18n/en.js'
import { formatScore, scorePercent } from '../../lib/scores.js'
import Panel from '../dashboard/Panel.jsx'

function SkillMeter({ label, hint, value }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-primary">{label}</span>
        <span className="text-sm font-semibold text-primary">
          {formatScore(value)}
          <span className="font-normal text-primary/40"> / {SCORE_MAX}</span>
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-track">
        <div
          className="h-2 rounded-full bg-brand-blue transition-[width] duration-500"
          style={{ width: `${scorePercent(value)}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-primary/50">{hint}</p>
    </div>
  )
}

export default function SkillBreakdown({ scores }) {
  const t = strings.passport

  return (
    <Panel className="h-full">
      <h3 className="text-base font-semibold text-primary">{t.breakdownTitle}</h3>
      <div className="mt-5 space-y-5">
        {Object.keys(t.skills).map((skill) => (
          <SkillMeter
            key={skill}
            label={t.skills[skill]}
            hint={t.skillHints[skill]}
            value={scores[skill]}
          />
        ))}
      </div>
    </Panel>
  )
}
