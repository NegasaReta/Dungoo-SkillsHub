import NavIcon from '../app/NavIcon.jsx'
import Panel from './Panel.jsx'

export default function GreetingCard({ greeting, name, sessionsRemaining, focusArea }) {
  return (
    <Panel className="relative h-full overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-blue/10 blur-3xl"
      />

      <div className="relative">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">
          {greeting}
          {name ? `, ${name}` : ''}!
        </h1>

        <p className="mt-3 max-w-lg text-sm leading-relaxed text-primary/70">
          You&apos;re <span className="font-semibold text-primary">{sessionsRemaining} sessions</span>{' '}
          away from your weekly goal. Your focus on {focusArea} is paying off.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90"
          >
            <NavIcon name="play" className="h-4 w-4" />
            Continue Learning
          </button>
          <button
            type="button"
            className="rounded-lg border border-primary/15 bg-white px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
          >
            View Plan
          </button>
        </div>
      </div>
    </Panel>
  )
}
