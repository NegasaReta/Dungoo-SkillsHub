import NavIcon from '../app/NavIcon.jsx'
import Panel from '../dashboard/Panel.jsx'

export default function StatCard({ icon, label, value, suffix, changePercent, hint }) {
  const positive = changePercent >= 0
  const showChange = typeof changePercent === 'number'

  return (
    <Panel className="flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
        <NavIcon name={icon} className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-primary/60">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-primary">{value}</span>
          {suffix && <span className="text-xs text-primary/50">{suffix}</span>}
        </div>
        {hint && <p className="mt-0.5 truncate text-[11px] text-primary/45">{hint}</p>}
      </div>

      {showChange && (
        <span
          className={`shrink-0 self-start text-[11px] font-semibold ${
            changePercent === 0 ? 'text-primary/40' : positive ? 'text-success' : 'text-danger'
          }`}
        >
          {changePercent === 0 ? '–' : positive ? '↗' : '↘'} {Math.abs(changePercent)}%
        </span>
      )}
    </Panel>
  )
}
