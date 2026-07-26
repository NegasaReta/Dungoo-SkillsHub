import NavIcon from '../app/NavIcon.jsx'
import Panel from '../dashboard/Panel.jsx'

const KIND_DOT = {
  achievement: 'bg-accent',
  course: 'bg-success',
  system: 'bg-primary/30',
}

export default function GrowthMilestones({ milestones }) {
  return (
    <Panel className="h-full">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-primary">Growth Milestones</h2>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue/10 text-link">
          <NavIcon name="spark" className="h-4 w-4" />
        </span>
      </div>

      <ol className="relative mt-5 space-y-5 border-l border-primary/10 pl-5">
        {milestones.map((milestone) => (
          <li key={milestone.id} className="relative">
            <span
              className={`absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-panel ${
                KIND_DOT[milestone.kind]
              }`}
            />
            <p className="text-[11px] font-medium uppercase tracking-wide text-primary/45">
              {milestone.date}
            </p>
            <p className="mt-1 text-sm font-semibold text-primary">{milestone.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-primary/60">{milestone.detail}</p>
            <span className="mt-2 inline-flex rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary/55">
              {milestone.kind}
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  )
}
