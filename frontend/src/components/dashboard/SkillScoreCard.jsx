import Panel from './Panel.jsx'

export default function SkillScoreCard({ label, value, outOf, changePercent }) {
  const positive = changePercent >= 0

  return (
    <Panel className="flex h-full flex-col justify-center">
      <p className="text-xs text-primary/60">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-primary">{value}</span>
        {outOf && <span className="text-sm text-primary/50">/ {outOf}</span>}
        {changePercent !== 0 && (
          <span className={`text-xs font-medium ${positive ? 'text-success' : 'text-red-600'}`}>
            {positive ? '▲' : '▼'} {Math.abs(changePercent)}%
          </span>
        )}
      </div>
    </Panel>
  )
}
