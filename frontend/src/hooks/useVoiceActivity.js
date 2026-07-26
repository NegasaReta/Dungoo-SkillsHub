import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Watches the mic and reports how loud it is, so the room can end a turn on its
 * own instead of asking the candidate to press stop.
 *
 * Analysis is local — the Web Audio graph never leaves the tab and nothing here
 * is recorded. `useInterviewMedia` owns the recording.
 */

// Tuned by ear on a laptop mic. Speech peaks well above this; room noise sits below.
const SPEECH_LEVEL = 0.045
const SILENCE_MS = 2000
// Someone who never says anything should still hand the turn back eventually.
const NO_SPEECH_TIMEOUT_MS = 12000
// Measure every frame, but publish to React far less often: at 60fps this would
// re-render the room — video tile and all — faster than it can paint.
const PUBLISH_EVERY_MS = 100
// Speech dips between syllables, so hold the speaking flag briefly to stop the
// indicator strobing and to keep re-renders down.
const SPEAKING_HOLD_MS = 300

export default function useVoiceActivity({ onSilence, silenceMs = SILENCE_MS } = {}) {
  const contextRef = useRef(null)
  const analyserRef = useRef(null)
  const frameRef = useRef(null)
  const bufferRef = useRef(null)

  const startedAtRef = useRef(0)
  const lastSpeechAtRef = useRef(0)
  const heardSpeechRef = useRef(false)
  const firedRef = useRef(false)
  const speakingUntilRef = useRef(0)
  const publishedSpeakingRef = useRef(false)
  const publishedLevelAtRef = useRef(0)
  // Read from the animation loop, so keep it in a ref rather than state.
  const onSilenceRef = useRef(onSilence)

  const [level, setLevel] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    onSilenceRef.current = onSilence
  }, [onSilence])

  const stop = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = null

    contextRef.current?.close().catch(() => {
      // Already closed by a teardown race; nothing to recover.
    })
    contextRef.current = null
    analyserRef.current = null

    setLevel(0)
    setIsSpeaking(false)
  }, [])

  const start = useCallback(
    (stream) => {
      const audioTracks = stream?.getAudioTracks() ?? []
      if (!audioTracks.length) return

      stop()

      const context = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = context.createAnalyser()
      analyser.fftSize = 1024
      // Smooths the meter so it reads as a voice level, not a jittery waveform.
      analyser.smoothingTimeConstant = 0.7
      context.createMediaStreamSource(new MediaStream(audioTracks)).connect(analyser)

      contextRef.current = context
      analyserRef.current = analyser
      bufferRef.current = new Float32Array(analyser.fftSize)

      const now = performance.now()
      startedAtRef.current = now
      lastSpeechAtRef.current = now
      heardSpeechRef.current = false
      firedRef.current = false
      speakingUntilRef.current = 0
      publishedSpeakingRef.current = false
      publishedLevelAtRef.current = 0

      const tick = () => {
        const buffer = bufferRef.current
        analyser.getFloatTimeDomainData(buffer)

        let sumOfSquares = 0
        for (let i = 0; i < buffer.length; i += 1) sumOfSquares += buffer[i] * buffer[i]
        const rms = Math.sqrt(sumOfSquares / buffer.length)

        const timestamp = performance.now()
        const loud = rms > SPEECH_LEVEL
        if (loud) {
          heardSpeechRef.current = true
          lastSpeechAtRef.current = timestamp
          speakingUntilRef.current = timestamp + SPEAKING_HOLD_MS
        }

        const speaking = timestamp < speakingUntilRef.current
        if (speaking !== publishedSpeakingRef.current) {
          publishedSpeakingRef.current = speaking
          setIsSpeaking(speaking)
        }
        if (timestamp - publishedLevelAtRef.current >= PUBLISH_EVERY_MS) {
          publishedLevelAtRef.current = timestamp
          setLevel(rms)
        }

        const quietFor = timestamp - lastSpeechAtRef.current
        const waitedFor = timestamp - startedAtRef.current
        const answerFinished = heardSpeechRef.current && quietFor >= silenceMs
        const nobodySpoke = !heardSpeechRef.current && waitedFor >= NO_SPEECH_TIMEOUT_MS

        if (!firedRef.current && (answerFinished || nobodySpoke)) {
          firedRef.current = true
          onSilenceRef.current?.({ heardSpeech: heardSpeechRef.current })
          return
        }

        frameRef.current = requestAnimationFrame(tick)
      }

      frameRef.current = requestAnimationFrame(tick)
    },
    [silenceMs, stop]
  )

  useEffect(() => stop, [stop])

  return { level, isSpeaking, start, stop }
}
