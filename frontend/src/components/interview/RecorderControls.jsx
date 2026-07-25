import Button from '../common/Button.jsx'
import { strings } from '../../i18n/en.js'

function formatDuration(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

export default function RecorderControls({ isRecording, hasRecording, seconds, onStart, onStop }) {
  const t = strings.interview

  return (
    <div className="flex flex-wrap items-center gap-3">
      {isRecording ? (
        <Button onClick={onStop}>{t.stop}</Button>
      ) : (
        <Button variant="accent" onClick={onStart}>
          {hasRecording ? t.rerecord : t.record}
        </Button>
      )}

      {isRecording && (
        <span className="inline-flex items-center gap-2 text-sm text-primary/70">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          {t.recording} · {formatDuration(seconds)}
        </span>
      )}

      {!isRecording && seconds > 0 && (
        <span className="text-sm text-primary/60">{formatDuration(seconds)}</span>
      )}
    </div>
  )
}
