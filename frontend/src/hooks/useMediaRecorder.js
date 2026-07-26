import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Camera/microphone capture for interview answers.
 *
 * Nothing is requested from the browser until `start` is called, so the consent
 * step stays in front of the permission prompt.
 */
export default function useMediaRecorder({ audio = true, video = true } = {}) {
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)

  const [isRecording, setIsRecording] = useState(false)
  const [stream, setStream] = useState(null)
  const [blobUrl, setBlobUrl] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState(null)

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStream(null)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio, video })
      streamRef.current = media
      setStream(media)
      chunksRef.current = []

      const recorder = new MediaRecorder(media)
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const recording = new Blob(chunksRef.current, { type: recorder.mimeType })
        setBlobUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous)
          return URL.createObjectURL(recording)
        })
        stopTracks()
      }

      recorder.start()
      recorderRef.current = recorder
      setSeconds(0)
      setIsRecording(true)
    } catch (cause) {
      setError(cause)
      stopTracks()
    }
  }, [audio, video, stopTracks])

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    setIsRecording(false)
  }, [])

  const reset = useCallback(() => {
    stop()
    setBlobUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
    setSeconds(0)
    setError(null)
  }, [stop])

  useEffect(() => {
    if (!isRecording) return undefined
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => clearInterval(timer)
  }, [isRecording])

  // Release the camera if the component unmounts mid-recording.
  useEffect(() => stopTracks, [stopTracks])

  return { isRecording, stream, blobUrl, seconds, error, start, stop, reset }
}
