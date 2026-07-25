import NavIcon from '../app/NavIcon.jsx'
import Panel from './Panel.jsx'

export default function StreakCard({ days, weekProgress }) {
  return (
    <Panel lift className="relative flex h-full flex-col items-center justify-center overflow-hidden text-center">
      <div
        aria-hidden="true"
        className="orb orb-accent pointer-events-none absolute -top-16 h-40 w-40 opacity-70"
      />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/30">
        <NavIcon name="leaf" className="h-7 w-7" />
      </span>

      <p className="mt-4 text-3xl font-bold text-primary">{days} Days</p>
      <p className="mt-1 text-xs text-primary/60">Current Practice Streak</p>

      <div className="mt-4 flex items-center gap-1.5">
        {weekProgress.map((active, index) => (
          <span
            key={index}
            className={`h-1.5 w-6 rounded-full ${active ? 'bg-accent' : 'bg-primary/10'}`}
          />
        ))}
      </div>
    </Panel>
  )
}
