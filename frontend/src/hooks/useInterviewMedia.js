import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Owns the camera + mic for the whole call, the way a meeting client would.
 *
 * The camera feeds the on-screen self-view and the on-device engagement model
 * only. Recording is deliberately built from the audio tracks alone, so no video
 * ever reaches a Blob and there is nothing to upload but speech.
 */
export default function useInterviewMedia() {
  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])

  const [stream, setStream] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [blob, setBlob] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [error, setError] = useState(null)

  const open = useCallback(async () => {
    setError(null)
    if (streamRef.current) return streamRef.current

    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: { width: { ideal: 640 }, facingMode: 'user' },
      })
      streamRef.current = media
      setStream(media)
      setMicOn(true)
      setCameraOn(true)
      return media
    } catch (cause) {
      setError(cause)
      throw cause
    }
  }, [])

  const startAnswer = useCallback(async () => {
    setError(null)
    setBlob(null)
    setSeconds(0)

    const media = streamRef.current ?? (await open())
    // Audio-only source: the candidate is never asked to record video.
    const voiceOnly = new MediaStream(media.getAudioTracks())
    chunksRef.current = []

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : undefined
    const recorder = mimeType
      ? new MediaRecorder(voiceOnly, { mimeType })
      : new MediaRecorder(voiceOnly)

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data)
    }

    recorder.start()
    recorderRef.current = recorder
    setIsRecording(true)
  }, [open])

  const stopAnswer = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state !== 'recording') {
      setIsRecording(false)
      return Promise.resolve(null)
    }

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const recording = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        setBlob(recording)
        setIsRecording(false)
        resolve(recording)
      }
      recorder.stop()
    })
  }, [])

  const clearAnswer = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    recorderRef.current = null
    setIsRecording(false)
    setBlob(null)
    setSeconds(0)
  }, [])

  const toggleMic = useCallback(() => {
    const tracks = streamRef.current?.getAudioTracks() ?? []
    if (!tracks.length) return
    const next = !tracks[0].enabled
    tracks.forEach((track) => {
      track.enabled = next
    })
    setMicOn(next)
  }, [])

  const toggleCamera = useCallback(() => {
    const tracks = streamRef.current?.getVideoTracks() ?? []
    if (!tracks.length) return
    const next = !tracks[0].enabled
    tracks.forEach((track) => {
      track.enabled = next
    })
    setCameraOn(next)
  }, [])

  const close = useCallback(() => {
    clearAnswer()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStream(null)
    setError(null)
  }, [clearAnswer])

  useEffect(() => {
    if (!isRecording) return undefined
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => clearInterval(timer)
  }, [isRecording])

  useEffect(() => close, [close])

  return {
    stream,
    isRecording,
    blob,
    seconds,
    micOn,
    cameraOn,
    error,
    open,
    startAnswer,
    stopAnswer,
    clearAnswer,
    toggleMic,
    toggleCamera,
    close,
  }
}
