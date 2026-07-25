import { ConversationProvider, useConversation } from '@elevenlabs/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../common/Button.jsx'
import Card from '../common/Card.jsx'
import ConnectionStatus from './ConnectionStatus.jsx'

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID

// Two is enough to survive StrictMode's extra mount in dev without dialling the agent
// in a loop if it refuses the connection. The SDK itself rejects overlapping starts.
const MAX_AUTO_ATTEMPTS = 2

function VoiceSession() {
  const [userCaption, setUserCaption] = useState('')
  const [aiCaption, setAiCaption] = useState('')
  const [error, setError] = useState(null)
  const [handsFree, setHandsFree] = useState(false)
  const [isTalking, setIsTalking] = useState(false)
  const [autoConnect, setAutoConnect] = useState(true)
  const [isDialing, setIsDialing] = useState(false)
  const autoAttemptsRef = useRef(0)

  // Hold-to-talk keeps the mic shut between turns, so room noise cannot open a turn.
  // The agent's own voice-detection sensitivity is not exposed to clients.
  const micMuted = !handsFree && !isTalking

  const { startSession, endSession, status } = useConversation({
    micMuted,
    onMessage: ({ message, role, source }) => {
      // `source` ('user' | 'ai') is deprecated in favour of `role` ('user' | 'agent'),
      // so read whichever the installed SDK provides.
      if ((role ?? source) === 'user') setUserCaption(message)
      else setAiCaption(message)
    },
    onConnect: () => {
      setError(null)
      // Once connected, a later drop should not silently dial the agent again.
      setAutoConnect(false)
    },
    onError: (message) => setError(message),
  })

  const isLive = status === 'connected' || status === 'connecting'

  const connect = useCallback(async () => {
    setError(null)

    if (!AGENT_ID) {
      setError('VITE_ELEVENLABS_AGENT_ID is not set. Add it to frontend/.env.local and restart.')
      return
    }

    setIsDialing(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Only used to surface the permission prompt; the SDK opens its own capture stream.
      stream.getTracks().forEach((track) => track.stop())
    } catch {
      setError('Microphone access was blocked. Allow it in your browser to practice out loud.')
      setIsDialing(false)
      return
    }

    startSession({ agentId: AGENT_ID })
    setIsDialing(false)
  }, [startSession])

  useEffect(() => {
    if (!autoConnect || status !== 'disconnected') return
    if (autoAttemptsRef.current >= MAX_AUTO_ATTEMPTS) return
    autoAttemptsRef.current += 1
    connect()
  }, [autoConnect, status, connect])

  const statusRef = useRef(status)
  statusRef.current = status
  const endSessionRef = useRef(endSession)
  endSessionRef.current = endSession
  useEffect(
    () => () => {
      if (statusRef.current !== 'disconnected') endSessionRef.current?.()
    },
    [],
  )

  function handleEnd() {
    setAutoConnect(false)
    endSession()
  }

  function handleTalkKey(event, talking) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      setIsTalking(talking)
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Talk to your coach</h2>
        <ConnectionStatus status={status} />
      </div>

      <p className="mt-2 text-sm text-slate-600">
        The call starts as soon as you open this tab, so your browser will ask for the
        microphone. It is only open while the call is live and the audio goes straight to the
        coach. Nothing is recorded here.
      </p>

      <div className="mt-4 flex gap-2">
        {isLive || isDialing ? (
          <Button onClick={handleEnd} disabled={!isLive}>
            End call
          </Button>
        ) : (
          <Button onClick={connect}>Reconnect</Button>
        )}
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 border-t border-slate-100 pt-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={handsFree}
            onChange={(event) => setHandsFree(event.target.checked)}
          />
          Hands-free (the coach decides when you have finished speaking)
        </label>

        {handsFree ? (
          <p className="mt-2 text-sm text-slate-500">
            The mic stays open. In a noisy room the coach may answer background sound.
          </p>
        ) : (
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              disabled={status !== 'connected'}
              onPointerDown={() => setIsTalking(true)}
              onPointerUp={() => setIsTalking(false)}
              onPointerLeave={() => setIsTalking(false)}
              onPointerCancel={() => setIsTalking(false)}
              onKeyDown={(event) => handleTalkKey(event, true)}
              onKeyUp={(event) => handleTalkKey(event, false)}
              className={`rounded-lg px-4 py-2 text-white disabled:opacity-50 ${
                isTalking ? 'bg-emerald-600' : 'bg-slate-900'
              }`}
            >
              {isTalking ? 'Listening…' : 'Hold to talk'}
            </button>
            <span className="text-sm text-slate-500">{micMuted ? 'Mic muted' : 'Mic open'}</span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3" aria-live="polite">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">You</p>
          <p className="text-slate-900">{userCaption || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Coach</p>
          <p className="text-slate-900">{aiCaption || '—'}</p>
        </div>
      </div>
    </Card>
  )
}

export default function VoicePractice() {
  return (
    <ConversationProvider>
      <VoiceSession />
    </ConversationProvider>
  )
}
