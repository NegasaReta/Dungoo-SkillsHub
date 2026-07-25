import NavIcon from '../app/NavIcon.jsx'
import Panel from '../dashboard/Panel.jsx'

const TONES = {
  up: { icon: 'trend', style: 'bg-success/10 text-success' },
  focus: { icon: 'spark', style: 'bg-accent/20 text-accent' },
  info: { icon: 'help', style: 'bg-brand-blue/10 text-brand-blue' },
}

export default function InsightsPanel({ insights }) {
  return (
    <Panel className="h-full">
      <h2 className="text-base font-semibold text-primary">What the numbers say</h2>
      <p className="mt-1 text-xs text-primary/60">Read straight from your scores</p>

      <ul className="mt-4 space-y-3">
        {insights.map((insight) => {
          const tone = TONES[insight.tone] ?? TONES.info

          return (
            <li key={insight.title} className="flex gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.style}`}
              >
                <NavIcon name={tone.icon} className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary">{insight.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-primary/60">{insight.detail}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
