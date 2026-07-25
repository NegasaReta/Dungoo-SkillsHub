import CallIcon from './CallIcon.jsx'
import { strings } from '../../i18n/en.js'

/** The meeting toolbar: mute, camera, captions, and leaving the room. */
export default function CallControls({
  micOn,
  cameraOn,
  captionsOn,
  onToggleMic,
  onToggleCamera,
  onToggleCaptions,
  onLeave,
  leaveLabel,
  leaveDisabled = false,
}) {
  const t = strings.interview

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <RoundButton
        icon={micOn ? 'mic' : 'micOff'}
        label={micOn ? t.muteMic : t.unmuteMic}
        active={micOn}
        onClick={onToggleMic}
      />
      <RoundButton
        icon={cameraOn ? 'camera' : 'cameraOff'}
        label={cameraOn ? t.cameraOffAction : t.cameraOnAction}
        active={cameraOn}
        onClick={onToggleCamera}
      />
      <RoundButton
        icon="captions"
        label={captionsOn ? t.captionsHide : t.captionsShow}
        active={captionsOn}
        onClick={onToggleCaptions}
      />

      <button
        type="button"
        onClick={onLeave}
        disabled={leaveDisabled}
        className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
      >
        <CallIcon name="leave" className="h-5 w-5" />
        {leaveLabel ?? t.leaveCall}
      </button>
    </div>
  )
}

function RoundButton({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
        active
          ? 'bg-white/10 text-white hover:bg-white/20'
          : 'bg-accent text-primary hover:bg-accent/90'
      }`}
    >
      <CallIcon name={icon} />
    </button>
  )
}
