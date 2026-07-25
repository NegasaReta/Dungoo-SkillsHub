import { SCORE_MAX } from '../../constants.js'

export default function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-primary/70">{label}</span>
        <span className="font-semibold text-primary">
          {value.toFixed(1)}
          <span className="font-normal text-primary/50"> / {SCORE_MAX}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-surface">
        <div
          className="h-2 rounded-full bg-accent"
          style={{ width: `${(value / SCORE_MAX) * 100}%` }}
        />
      </div>
    </div>
  )
}
