import { ConversationProvider, useConversation } from '@elevenlabs/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import NavIcon from '../app/NavIcon.jsx'
import Panel from '../dashboard/Panel.jsx'
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
    <Panel className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-primary">Spoken practice</h2>
        <ConnectionStatus status={status} />
      </div>

      <p className="mt-2 text-sm leading-relaxed text-primary/60">
        The call starts as soon as you open this tab, so your browser will ask for the microphone.
        It is only open while the call is live, and nothing is recorded here.
      </p>

      {error && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs leading-relaxed text-danger">
          <NavIcon name="help" className="mt-px h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col items-center rounded-xl border border-primary/10 bg-surface px-5 py-6">
        {handsFree ? (
          <>
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-full ${
                isLive ? 'bg-success/15 text-success' : 'bg-primary/10 text-primary/40'
              }`}
            >
              <NavIcon name="mic" className="h-7 w-7" />
            </span>
            <p className="mt-3 text-sm font-medium text-primary">
              {isLive ? 'The mic is open — just talk' : 'Not connected'}
            </p>
            <p className="mt-1 max-w-xs text-center text-xs leading-relaxed text-primary/55">
              In a noisy room the coach may answer background sound.
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={status !== 'connected'}
              onPointerDown={() => setIsTalking(true)}
              onPointerUp={() => setIsTalking(false)}
              onPointerLeave={() => setIsTalking(false)}
              onPointerCancel={() => setIsTalking(false)}
              onKeyDown={(event) => handleTalkKey(event, true)}
              onKeyUp={(event) => handleTalkKey(event, false)}
              className={`flex h-20 w-20 flex-col items-center justify-center rounded-full text-white transition-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue disabled:cursor-not-allowed disabled:bg-primary/20 disabled:text-primary/40 ${
                isTalking
                  ? 'scale-105 bg-success shadow-lg shadow-success/30'
                  : 'bg-brand-blue hover:scale-105'
              }`}
            >
              <NavIcon name="mic" className="h-7 w-7" />
            </button>
            <p className="mt-3 text-sm font-medium text-primary">
              {isTalking ? 'Listening…' : 'Hold to talk'}
            </p>
            <p className="mt-1 text-xs text-primary/55">
              {micMuted ? 'Mic muted between turns' : 'Mic open'}
            </p>
          </>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {isLive || isDialing ? (
            <button
              type="button"
              onClick={handleEnd}
              disabled={!isLive}
              className="inline-flex items-center gap-2 rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              End call
            </button>
          ) : (
            <button
              type="button"
              onClick={connect}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90"
            >
              <NavIcon name="play" className="h-4 w-4" />
              Reconnect
            </button>
          )}

          <label className="inline-flex items-center gap-2 rounded-lg border border-primary/15 px-3 py-2 text-xs font-medium text-primary/70">
            <input
              type="checkbox"
              checked={handsFree}
              onChange={(event) => setHandsFree(event.target.checked)}
              className="accent-brand-blue"
            />
            Hands-free
          </label>
        </div>
      </div>

      <div className="mt-5 space-y-3" aria-live="polite">
        <Caption label="You" text={userCaption} tone="user" />
        <Caption label="Coach" text={aiCaption} tone="coach" />
      </div>
    </Panel>
  )
}

function Caption({ label, text, tone }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        tone === 'user' ? 'border-brand-blue/20 bg-brand-blue/5' : 'border-primary/10 bg-surface'
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/40">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-primary">
        {text || <span className="text-primary/35">Nothing said yet.</span>}
      </p>
    </div>
  )
}

export default function VoicePractice() {
  return (
    <ConversationProvider>
      <VoiceSession />
    </ConversationProvider>
  )
}
