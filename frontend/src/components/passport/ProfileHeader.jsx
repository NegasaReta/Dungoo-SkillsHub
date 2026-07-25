import NavIcon from '../app/NavIcon.jsx'
import Panel from '../dashboard/Panel.jsx'

export default function ProfileHeader({ user, passport }) {
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Your Name'
  const initials = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?'

  return (
    <Panel className="h-full">
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="shrink-0 text-center sm:text-left">
          <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-blue text-2xl font-bold text-white sm:mx-0">
            {initials}
          </span>
          <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-primary/45">
            Passport ID
          </p>
          <p className="font-mono text-xs text-primary/70">{passport.passportId}</p>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold text-primary">{fullName}</h2>
          <p className="mt-1 text-sm font-medium text-brand-blue">{passport.role}</p>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-primary/45">
                <NavIcon name="location" className="h-3.5 w-3.5" />
                Target industry
              </dt>
              <dd className="mt-1 text-sm text-primary">{passport.target}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-primary/45">
                <NavIcon name="language" className="h-3.5 w-3.5" />
                Languages
              </dt>
              <dd className="mt-1 text-sm text-primary">{passport.languages}</dd>
            </div>
          </dl>

          <p className="mt-4 text-sm leading-relaxed text-primary/70">{passport.summary}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {passport.verified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                <NavIcon name="verified" className="h-3.5 w-3.5" />
                Scored by Dungoo AI
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-primary">
              <NavIcon name="trophy" className="h-3.5 w-3.5 text-accent" />
              {passport.tier}
            </span>
          </div>
        </div>
      </div>
    </Panel>
  )
}
