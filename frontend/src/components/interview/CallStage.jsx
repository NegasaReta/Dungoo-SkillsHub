import AiAvatar from './AiAvatar.jsx'
import ParticipantTile from './ParticipantTile.jsx'
import { format, strings } from '../../i18n/en.js'

/** The two-participant grid, with the meeting status line above it. */
export default function CallStage({
  turn,
  status,
  interviewerSpeaking,
  candidateName,
  stream,
  cameraOn,
  micOn,
  candidateSpeaking,
  level,
}) {
  const t = strings.interview

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm text-white/70">
          <span
            className={`h-2 w-2 rounded-full ${
              interviewerSpeaking ? 'animate-pulse bg-accent' : 'bg-white/40'
            }`}
          />
          {status}
        </span>

        {turn && (
          <span className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/70">
              {format(t.turnProgress, {
                current: turn.turn_index + 1,
                total: turn.max_turns,
              })}
            </span>
            {turn.is_final && (
              <span className="rounded-full bg-accent px-2.5 py-1 font-medium text-primary">
                {t.finalTurn}
              </span>
            )}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ParticipantTile
          name={t.interviewerName}
          label={t.interviewerCameraOff}
          avatar={<AiAvatar />}
          micOn
          isSpeaking={interviewerSpeaking}
          level={interviewerSpeaking ? 0.2 : 0}
        />
        <ParticipantTile
          name={candidateName}
          label={t.yourCameraOff}
          avatar={<InitialsAvatar name={candidateName} />}
          stream={stream}
          videoOn={cameraOn}
          micOn={micOn}
          isSpeaking={candidateSpeaking}
          level={level}
        />
      </div>
    </div>
  )
}

function InitialsAvatar({ name }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  return (
    <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold text-white ring-2 ring-white/20">
      {initials || '?'}
    </span>
  )
}
