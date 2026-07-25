import { useEffect, useRef } from 'react'

import CallIcon from './CallIcon.jsx'

/**
 * One participant in the room. Shows a live video track when there is one and a
 * profile avatar when there is not, and rings the tile while they are speaking.
 */
export default function ParticipantTile({
  name,
  label,
  avatar,
  stream = null,
  videoOn = false,
  micOn = true,
  isSpeaking = false,
  level = 0,
}) {
  const videoRef = useRef(null)

  useEffect(() => {
    const element = videoRef.current
    if (element) element.srcObject = stream ?? null
  }, [stream])

  const showVideo = Boolean(stream) && videoOn

  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-2xl bg-black/40 ring-2 transition-colors ${
        isSpeaking ? 'ring-accent' : 'ring-white/10'
      }`}
    >
      {showVideo ? (
        <video
          ref={videoRef}
          className="h-full w-full scale-x-[-1] object-cover"
          autoPlay
          muted
          playsInline
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          {avatar}
          {label && <p className="text-xs text-white/60">{label}</p>}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
        <span className="truncate text-sm font-medium text-white">{name}</span>

        <span className="flex shrink-0 items-center gap-2">
          {isSpeaking && <SpeakingBars level={level} />}
          <span className={micOn ? 'text-white/70' : 'text-white'}>
            <CallIcon name={micOn ? 'mic' : 'micOff'} className="h-4 w-4" />
          </span>
        </span>
      </div>
    </div>
  )
}

/** Three bars that ride the mic level, like a meeting client's speaking dot. */
function SpeakingBars({ level }) {
  // Normalised against a comfortable speaking volume rather than full scale.
  const loudness = Math.min(1, level / 0.25)

  return (
    <span className="flex items-end gap-0.5" aria-hidden="true">
      {[0.55, 1, 0.7].map((weight, index) => (
        <span
          key={index}
          // The pulse keeps the bars alive for the interviewer, whose speech is
          // played back rather than measured, so it has no level to ride.
          className="w-0.5 animate-pulse rounded-full bg-accent transition-[height] duration-100"
          style={{
            height: `${4 + loudness * weight * 12}px`,
            animationDelay: `${index * 140}ms`,
          }}
        />
      ))}
    </span>
  )
}
