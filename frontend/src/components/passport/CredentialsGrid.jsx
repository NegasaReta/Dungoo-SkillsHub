import NavIcon from '../app/NavIcon.jsx'
import Panel from '../dashboard/Panel.jsx'

const STATUS_STYLES = {
  gold: 'bg-accent/15 text-primary ring-accent/40',
  elite: 'bg-brand-blue/10 text-link ring-brand-blue/25',
  progress: 'bg-surface text-primary/70 ring-primary/15',
}

export default function CredentialsGrid({ credentials }) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-primary">Verified Credentials</h2>
        <button
          type="button"
          className="text-xs font-medium text-link transition-colors hover:text-primary"
        >
          View all
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {credentials.map((credential) => (
          <article
            key={credential.id}
            className="lift sheen rounded-xl border border-primary/10 bg-surface p-4"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-panel text-link shadow-sm">
              <NavIcon name={credential.icon} className="h-4 w-4" />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-primary">{credential.title}</h3>
            <p className="mt-1 text-xs text-primary/55">{credential.subtitle}</p>
            <span
              className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ${
                STATUS_STYLES[credential.status]
              }`}
            >
              {credential.statusLabel}
            </span>
          </article>
        ))}

        <button
          type="button"
          className="lift flex min-h-[148px] flex-col items-center justify-center rounded-xl border border-dashed border-primary/20 bg-panel p-4 text-center hover:border-brand-blue/40 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-link">
            <NavIcon name="plus" className="h-5 w-5" />
          </span>
          <span className="mt-3 text-sm font-medium text-primary">Add credential</span>
          <span className="mt-1 text-xs text-primary/50">Upload or claim a new badge</span>
        </button>
      </div>
    </Panel>
  )
}
