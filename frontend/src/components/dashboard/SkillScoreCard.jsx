import Panel from './Panel.jsx'

export default function SkillScoreCard({ value, changePercent }) {
  const positive = changePercent >= 0

  return (
    <Panel className="flex h-full flex-col justify-center">
      <p className="text-xs text-primary/60">Global Skill Score</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-primary">{value}</span>
        <span className={`text-xs font-medium ${positive ? 'text-app-teal' : 'text-red-600'}`}>
          {positive ? '▲' : '▼'} {Math.abs(changePercent)}%
        </span>
      </div>
    </Panel>
  )
}
