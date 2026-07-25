import ScoreBar from '../interview/ScoreBar.jsx'
import Panel from './Panel.jsx'

export default function ScoreBreakdownCard({ averages, hasHistory }) {
  return (
    <Panel className="h-full">
      <h2 className="text-base font-semibold text-primary">Score Breakdown</h2>
      <p className="mt-1 text-xs text-primary/60">Averaged across every scored answer</p>

      {hasHistory ? (
        <div className="mt-6 space-y-4">
          <ScoreBar label="Clarity" value={averages.clarity} />
          <ScoreBar label="Confidence" value={averages.confidence} />
          <ScoreBar label="STAR structure" value={averages.star} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-primary/60">
          Clarity, confidence, and STAR structure are scored on every answer you submit.
        </p>
      )}
    </Panel>
  )
}
