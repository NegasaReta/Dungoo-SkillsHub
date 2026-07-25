import { Link } from 'react-router-dom'

import AppShell from '../components/app/AppShell.jsx'
import Panel from '../components/dashboard/Panel.jsx'

export default function ComingSoon({ title }) {
  return (
    <AppShell>
      <Panel className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden text-center">
        <div aria-hidden="true" className="scene-3d pointer-events-none absolute inset-0">
          <div className="grid-floor absolute inset-x-0 bottom-0 h-64" />
        </div>
        <div
          aria-hidden="true"
          className="orb orb-blue float-slow pointer-events-none absolute -top-20 h-64 w-64"
        />
        <h1 className="relative text-2xl font-semibold text-primary">{title}</h1>
        <p className="relative mt-2 max-w-sm text-sm text-primary/60">
          This section is not built yet. It is reachable from the sidebar so the navigation works
          end to end.
        </p>
        <div className="relative mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/interview"
            className="rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
          >
            Practice an interview
          </Link>
          <Link
            to="/dashboard"
            className="rounded-lg border border-primary/15 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
          >
            Back to dashboard
          </Link>
        </div>
      </Panel>
    </AppShell>
  )
}
