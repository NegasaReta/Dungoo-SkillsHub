import { Link } from 'react-router-dom'

import NavIcon from '../app/NavIcon.jsx'
import Panel from './Panel.jsx'

export default function GreetingCard({ greeting, name, sessionsRemaining, focusArea }) {
  return (
    <Panel spotlight className="relative h-full overflow-hidden">
      <div
        aria-hidden="true"
        className="orb orb-blue pointer-events-none absolute -right-16 -top-24 h-64 w-64"
      />
      <div
        aria-hidden="true"
        className="orb orb-accent float-slower pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 opacity-70"
      />

      <div className="relative">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">
          {greeting}
          {name ? `, ${name}` : ''}!
        </h1>

        <p className="mt-3 max-w-lg text-sm leading-relaxed text-primary/70">
          {sessionsRemaining === 0 ? (
            <>You&apos;ve hit your weekly practice goal.</>
          ) : (
            <>
              You&apos;re{' '}
              <span className="font-semibold text-primary">
                {sessionsRemaining} session{sessionsRemaining === 1 ? '' : 's'}
              </span>{' '}
              away from your weekly goal.
            </>
          )}{' '}
          Next win: sharpen {focusArea}.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/interview"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
          >
            <NavIcon name="play" className="h-4 w-4" />
            Start practising
          </Link>
          <Link
            to="/passport"
            className="rounded-lg border border-primary/15 bg-panel px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
          >
            View Skill Passport
          </Link>
        </div>
      </div>
    </Panel>
  )
}
