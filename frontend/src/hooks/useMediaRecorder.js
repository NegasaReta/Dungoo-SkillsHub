import { useCallback, useRef, useState } from 'react'

export default function useMediaRecorder({ audio = true, video = false } = {}) {
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [blob, setBlob] = useState(null)
  const [error, setError] = useState(null)

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio, video })
      streamRef.current = stream
      chunksRef.current = []

      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        setBlob(new Blob(chunksRef.current, { type: recorder.mimeType }))
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      recorderRef.current = recorder
      setBlob(null)
      setIsRecording(true)
    } catch (err) {
      setError(err)
    }
  }, [audio, video])

  const stop = useCallback(() => {
    recorderRef.current?.stop()
    setIsRecording(false)
  }, [])

  return { isRecording, blob, error, start, stop, stream: streamRef.current }
}
