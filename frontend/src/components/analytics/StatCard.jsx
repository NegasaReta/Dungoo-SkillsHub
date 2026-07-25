import NavIcon from '../app/NavIcon.jsx'
import Panel from '../dashboard/Panel.jsx'

export default function StatCard({ icon, label, value, suffix, changePercent }) {
  const positive = changePercent >= 0

  return (
    <Panel className="flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
        <NavIcon name={icon} className="h-5 w-5" />
      </span>

      <div className="min-w-0">
        <p className="text-xs text-primary/60">{label}</p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-primary">{value}</span>
          {suffix && <span className="text-xs text-primary/50">{suffix}</span>}
          {typeof changePercent === 'number' && changePercent !== 0 && (
            <span
              className={`text-[11px] font-medium ${positive ? 'text-success' : 'text-red-600'}`}
            >
              {positive ? '▲' : '▼'} {Math.abs(changePercent)}%
            </span>
          )}
        </div>
      </div>
    </Panel>
  )
}
