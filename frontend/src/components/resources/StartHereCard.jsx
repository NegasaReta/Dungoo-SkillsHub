import { format, strings } from '../../i18n/en.js'
import NavIcon from '../app/NavIcon.jsx'
import Panel from '../dashboard/Panel.jsx'

/**
 * Reading order pointed at the user's weakest scored axis. When there are no scores
 * it says so rather than implying the order was personalised.
 */
export default function StartHereCard({ resources, weakestAxis, hasScores, onOpen }) {
  const reason = hasScores
    ? format(strings.resources.planScored, { axis: weakestAxis })
    : strings.resources.planUnscored

  return (
    <Panel className="flex h-full flex-col">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <NavIcon name="spark" className="h-4 w-4" />
        </span>
        <h2 className="text-base font-semibold text-primary">{strings.resources.planTitle}</h2>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-primary/60">{reason}</p>

      <ol className="mt-4 flex-1 space-y-3">
        {resources.map((resource, index) => (
          <li key={resource.id}>
            <button
              type="button"
              onClick={() => onOpen(resource)}
              className="flex w-full items-start gap-3 rounded-xl p-2 text-left transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-[11px] font-semibold text-brand-blue">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-snug text-primary">
                  {resource.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-primary/50">
                  {resource.format === 'video'
                    ? format(strings.resources.videoBy, { channel: resource.channel })
                    : format(strings.resources.minutesRead, { minutes: resource.minutes })}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </Panel>
  )
}
