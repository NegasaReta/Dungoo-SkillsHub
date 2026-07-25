import NavIcon from '../app/NavIcon.jsx'
import Panel from './Panel.jsx'

export default function UpcomingCard({ items }) {
  return (
    <Panel className="h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-primary">Upcoming</h2>
        <button
          type="button"
          className="text-xs text-brand-blue transition-colors hover:text-primary"
        >
          View All
        </button>
      </div>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-xl border border-primary/10 bg-surface p-3"
          >
            <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-white">
              <span className="text-[9px] uppercase tracking-wide text-primary/50">
                {item.month}
              </span>
              <span className="text-sm font-semibold text-primary">{item.day}</span>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug text-primary">{item.title}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-primary/60">
                <NavIcon name="clock" className="h-3 w-3" />
                {item.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
