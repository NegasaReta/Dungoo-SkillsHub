import { useEffect, useRef } from 'react'

import { strings } from '../../i18n/en.js'

/**
 * Live captions for both sides of the conversation. The interviewer's line is
 * shown as it is spoken; the candidate's line lands as soon as the recording
 * comes back from transcription.
 */
export default function CaptionRail({ entries }) {
  const t = strings.interview
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [entries])

  return (
    <div className="rounded-2xl bg-black/40 p-4 ring-1 ring-white/10">
      <p className="text-xs font-medium uppercase tracking-wide text-white/50">
        {t.captionsTitle}
      </p>

      <div className="mt-3 max-h-44 space-y-3 overflow-y-auto">
        {entries.length === 0 ? (
          <p className="text-sm text-white/50">{t.captionsEmpty}</p>
        ) : (
          entries.map((entry) => (
            <p key={entry.id} className="text-sm leading-relaxed">
              <span
                className={`font-medium ${
                  entry.speaker === 'interviewer' ? 'text-accent' : 'text-white'
                }`}
              >
                {entry.speaker === 'interviewer' ? t.interviewerName : t.youName}
              </span>
              <span className="text-white/75">
                {' · '}
                {entry.pending ? <em className="text-white/50">{t.transcribing}</em> : entry.text}
              </span>
            </p>
          ))
        )}
        <span ref={endRef} />
      </div>
    </div>
  )
}
