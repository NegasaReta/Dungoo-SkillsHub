import { strings } from '../../i18n/en.js'
import Panel from '../dashboard/Panel.jsx'

function Tick({ achieved }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
        achieved ? 'bg-success text-white' : 'bg-track text-primary/30'
      }`}
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
        <path
          d="M5 10.5l3 3 7-7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export default function Milestones({ milestones = [] }) {
  const t = strings.passport

  return (
    <Panel className="h-full">
      <h3 className="text-base font-semibold text-primary">{t.milestonesTitle}</h3>
      <ul className="mt-4 space-y-3">
        {milestones.map((milestone) => (
          <li key={milestone.id} className="flex items-center gap-3 text-sm">
            <Tick achieved={milestone.achieved} />
            <span className={milestone.achieved ? 'text-primary' : 'text-primary/45'}>
              {t.milestones[milestone.id] ?? milestone.id}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
