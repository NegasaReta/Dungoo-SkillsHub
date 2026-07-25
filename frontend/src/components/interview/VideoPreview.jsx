import { useEffect, useRef } from 'react'

import { strings } from '../../i18n/en.js'

export default function VideoPreview({ stream, blobUrl }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const element = videoRef.current
    if (!element) return
    // A live stream goes on srcObject; a finished recording plays from a blob URL.
    element.srcObject = stream ?? null
  }, [stream])

  const showPlayback = !stream && blobUrl

  return (
    <div className="aspect-video overflow-hidden rounded-xl bg-primary">
      {stream || showPlayback ? (
        <video
          ref={videoRef}
          src={showPlayback ? blobUrl : undefined}
          className="h-full w-full object-cover"
          autoPlay={Boolean(stream)}
          muted={Boolean(stream)}
          controls={Boolean(showPlayback)}
          playsInline
        />
      ) : (
        <p className="flex h-full items-center justify-center p-6 text-center text-sm text-white/60">
          {strings.interview.cameraOff}
        </p>
      )}
    </div>
  )
}
