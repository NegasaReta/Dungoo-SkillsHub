import AppShell from '../components/app/AppShell.jsx'
import Panel from '../components/dashboard/Panel.jsx'

export default function ComingSoon({ title }) {
  return (
    <AppShell>
      <Panel className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-semibold text-primary">{title}</h1>
        <p className="mt-2 max-w-sm text-sm text-primary/60">
          This section is not built yet. It is reachable from the sidebar so the navigation works
          end to end.
        </p>
      </Panel>
    </AppShell>
  )
}
