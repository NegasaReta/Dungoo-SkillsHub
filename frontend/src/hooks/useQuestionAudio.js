import { useCallback, useEffect, useRef, useState } from 'react'

import { fetchTurnAudio } from '../api/interview.js'

/**
 * Fetches and plays the interviewer TTS for a turn. Audio is revoked when the
 * turn changes so blob URLs do not accumulate.
 */
export default function useQuestionAudio() {
  const audioRef = useRef(null)
  const urlRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const revoke = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    setIsPlaying(false)
  }, [])

  /**
   * `onEnded` also runs when audio could not be fetched or played, so a voice
   * outage lets the conversation continue against the on-screen question text
   * instead of stalling the room.
   */
  const play = useCallback(
    async (sessionId, turnIndex, { onEnded } = {}) => {
      revoke()
      setIsLoading(true)
      setError(null)

      const finish = () => {
        setIsPlaying(false)
        onEnded?.()
      }

      try {
        const url = await fetchTurnAudio(sessionId, turnIndex)
        urlRef.current = url

        const audio = new Audio(url)
        audioRef.current = audio

        audio.onended = finish
        audio.onerror = () => {
          setError(new Error('Could not play the interviewer audio.'))
          finish()
        }

        setIsPlaying(true)
        await audio.play()
      } catch (cause) {
        setError(cause)
        finish()
      } finally {
        setIsLoading(false)
      }
    },
    [revoke]
  )

  const stop = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  useEffect(() => revoke, [revoke])

  return { isPlaying, isLoading, error, play, stop, revoke }
}
