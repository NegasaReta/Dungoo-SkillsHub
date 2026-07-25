import Button from '../common/Button.jsx'

export default function RecorderControls({ isRecording, onStart, onStop }) {
  return (
    <div className="flex gap-2">
      <Button onClick={onStart} disabled={isRecording}>
        Record
      </Button>
      <Button onClick={onStop} disabled={!isRecording}>
        Stop
      </Button>
    </div>
  )
}
