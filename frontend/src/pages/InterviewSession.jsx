import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import AppShell from '../components/app/AppShell.jsx'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import Loader from '../components/common/Loader.jsx'
import CallControls from '../components/interview/CallControls.jsx'
import CallIcon from '../components/interview/CallIcon.jsx'
import CallStage from '../components/interview/CallStage.jsx'
import CaptionRail from '../components/interview/CaptionRail.jsx'
import RoomLobby from '../components/interview/RoomLobby.jsx'
import {
  completeSession,
  createSession,
  fetchNextTurn,
  fetchRoles,
  submitTurnAnswer,
} from '../api/interview.js'
import { ROLES } from '../constants.js'
import { useUser } from '../context/UserContext.jsx'
import useEngagementTracker from '../hooks/useEngagementTracker.js'
import useInterviewMedia from '../hooks/useInterviewMedia.js'
import useQuestionAudio from '../hooks/useQuestionAudio.js'
import useVoiceActivity from '../hooks/useVoiceActivity.js'
import { strings } from '../i18n/en.js'
import { classifyMediaError } from '../lib/mediaErrors.js'

const PHASES = {
  lobby: 'lobby',
  joining: 'joining',
  speaking: 'speaking',
  listening: 'listening',
  transcribing: 'transcribing',
  ending: 'ending',
  ended: 'ended',
}

function displayName(user, fallback) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(' ') || fallback
}

export default function InterviewSession() {
  const t = strings.interview
  const { user, isAuthenticated } = useUser()

  const [phase, setPhase] = useState(PHASES.lobby)
  const [roles, setRoles] = useState(ROLES)
  const [role, setRole] = useState(ROLES[0].slug)
  const [turn, setTurn] = useState(null)
  const [captions, setCaptions] = useState([])
  const [captionsOn, setCaptionsOn] = useState(true)
  const [notes, setNotes] = useState([])
  const [error, setError] = useState(null)

  const {
    stream,
    micOn,
    cameraOn,
    hasCamera,
    cameraFault,
    error: mediaError,
    open: openMedia,
    startAnswer,
    stopAnswer,
    toggleMic,
    toggleCamera,
    close: closeMedia,
  } = useInterviewMedia()
  const {
    isLoading: audioLoading,
    error: audioError,
    play: playQuestion,
    revoke: revokeQuestion,
  } = useQuestionAudio()
  const { start: startEngagement, stop: stopEngagement, reset: resetEngagement } =
    useEngagementTracker()

  // The mic hands the turn back on its own, so the handler is reached through a
  // ref: it is defined after the steps it triggers.
  const onSilenceRef = useRef(null)
  const { level, isSpeaking, start: startVoice, stop: stopVoice } = useVoiceActivity({
    onSilence: () => onSilenceRef.current?.(),
  })

  // Audio and mic events can outlive the call; they check these before acting.
  const liveRef = useRef(false)
  const sessionRef = useRef(null)
  const turnRef = useRef(null)

  const say = useCallback((id, speaker, text, pending = false) => {
    setCaptions((current) => {
      const entry = { id, speaker, text, pending }
      const index = current.findIndex((item) => item.id === id)
      if (index === -1) return [...current, entry]
      const next = [...current]
      next[index] = entry
      return next
    })
  }, [])

  const drop = useCallback((id) => {
    setCaptions((current) => current.filter((entry) => entry.id !== id))
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchRoles()
      .then((list) => {
        if (cancelled || !list?.length) return
        setRoles(list)
        setRole((current) =>
          list.some((item) => item.slug === current) ? current : list[0].slug
        )
      })
      .catch(() => {
        // Keep the local ROLES fallback when the roles endpoint is not up yet.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const openMic = useCallback(async () => {
    if (!liveRef.current) return
    try {
      await startAnswer()
      setPhase(PHASES.listening)
    } catch (cause) {
      setError(cause)
    }
  }, [startAnswer])

  const askQuestion = useCallback(
    async (sessionId) => {
      try {
        const next = await fetchNextTurn(sessionId)
        if (!liveRef.current) return

        turnRef.current = next
        setTurn(next)
        setPhase(PHASES.speaking)
        say(`question-${next.turn_index}`, 'interviewer', next.text)

        // The mic opens when the interviewer stops talking.
        playQuestion(sessionId, next.turn_index, { onEnded: openMic })
      } catch (cause) {
        setError(cause)
      }
    },
    [openMic, playQuestion, say]
  )

  const leaveRoom = useCallback(async () => {
    // Also stops a second click from completing the session twice.
    if (!liveRef.current) return
    liveRef.current = false
    setPhase(PHASES.ending)

    stopVoice()
    revokeQuestion()
    // The whole session's video, reduced to a handful of ratios, sent once.
    const engagement = stopEngagement()

    try {
      if (sessionRef.current) {
        const finished = await completeSession(sessionRef.current.id, engagement)
        setNotes(finished?.engagement_notes ?? [])
      }
    } catch (cause) {
      setError(cause)
    } finally {
      closeMedia()
      setPhase(PHASES.ended)
    }
  }, [closeMedia, revokeQuestion, stopEngagement, stopVoice])

  /** Send the answer for transcription, caption it, then keep the call moving. */
  const submitAnswer = useCallback(async () => {
    const current = turnRef.current
    const session = sessionRef.current
    if (!liveRef.current || !current || !session) return

    const captionId = `answer-${current.turn_index}`
    setPhase(PHASES.transcribing)
    say(captionId, 'candidate', '', true)

    const recording = await stopAnswer()
    if (!recording) {
      setError(new Error(t.errorNoRecording))
      drop(captionId)
      return
    }

    try {
      const answer = await submitTurnAnswer(session.id, current.turn_index, recording)
      say(captionId, 'candidate', answer.transcript)
    } catch {
      // Losing one transcript should not end the conversation, and the reason is
      // for the server log, not for the candidate mid-interview.
      setError(new Error(t.errorTranscription))
      drop(captionId)
    }

    if (!liveRef.current) return
    if (current.is_final) await leaveRoom()
    else await askQuestion(session.id)
  }, [askQuestion, drop, leaveRoom, say, stopAnswer, t.errorNoRecording, t.errorTranscription])

  useEffect(() => {
    onSilenceRef.current = submitAnswer
  }, [submitAnswer])

  const joinRoom = useCallback(async () => {
    if (!isAuthenticated) {
      setError(new Error(t.errorNotSignedIn))
      return
    }

    setError(null)
    setCaptions([])
    setPhase(PHASES.joining)

    try {
      const media = await openMedia()
      startEngagement(media)

      // Session is bound to the JWT user on the backend — no client user_id.
      const created = await createSession({ role })
      sessionRef.current = created
      liveRef.current = true

      await askQuestion(created.id)
    } catch (cause) {
      liveRef.current = false
      closeMedia()
      resetEngagement()
      setError(cause)
      setPhase(PHASES.lobby)
    }
  }, [
    askQuestion,
    closeMedia,
    isAuthenticated,
    openMedia,
    resetEngagement,
    role,
    startEngagement,
    t.errorNotSignedIn,
  ])

  const backToLobby = useCallback(() => {
    sessionRef.current = null
    turnRef.current = null
    setTurn(null)
    setCaptions([])
    setNotes([])
    setError(null)
    setPhase(PHASES.lobby)
  }, [])

  // Silence detection is on only while it is the candidate's turn and they are
  // unmuted, so a muted mic holds the turn open instead of ending it.
  useEffect(() => {
    if (phase === PHASES.listening && micOn && stream) startVoice(stream)
    else stopVoice()
  }, [micOn, phase, startVoice, stopVoice, stream])

  useEffect(
    () => () => {
      liveRef.current = false
    },
    []
  )

  const inRoom =
    phase === PHASES.speaking ||
    phase === PHASES.listening ||
    phase === PHASES.transcribing ||
    phase === PHASES.ending

  const status = {
    [PHASES.speaking]: audioLoading ? t.loadingAudio : t.speaking,
    [PHASES.listening]: micOn ? t.listening : t.micMuted,
    [PHASES.transcribing]: t.transcribing,
    [PHASES.ending]: t.wrappingUp,
  }[phase]

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        {error && <ErrorNotice error={error} mediaError={mediaError} />}

        {cameraFault && phase !== PHASES.lobby && <CameraNotice fault={cameraFault} />}

        {phase === PHASES.lobby && (
          <RoomLobby
            roles={roles}
            role={role}
            onRoleChange={setRole}
            onJoin={joinRoom}
            onCancel={backToLobby}
          />
        )}

        {phase === PHASES.joining && (
          <Card className="mx-auto max-w-xl">
            <Loader label={t.joining} />
          </Card>
        )}

        {inRoom && (
          <div className="space-y-5 rounded-3xl bg-primary p-4 sm:p-6">
            <CallStage
              turn={turn}
              status={status}
              interviewerSpeaking={phase === PHASES.speaking}
              candidateName={displayName(user, t.youName)}
              stream={stream}
              cameraOn={cameraOn}
              hasCamera={hasCamera}
              micOn={micOn}
              candidateSpeaking={phase === PHASES.listening && isSpeaking}
              level={level}
            />

            {audioError && <p className="text-xs text-white/50">{t.voiceUnavailable}</p>}

            {captionsOn && <CaptionRail entries={captions} />}

            <CallControls
              micOn={micOn}
              cameraOn={cameraOn}
              hasCamera={hasCamera}
              captionsOn={captionsOn}
              onToggleMic={toggleMic}
              onToggleCamera={toggleCamera}
              onToggleCaptions={() => setCaptionsOn((value) => !value)}
              onLeave={leaveRoom}
              leaveLabel={phase === PHASES.ending ? t.wrappingUp : undefined}
              leaveDisabled={phase === PHASES.ending}
            />
          </div>
        )}

        {phase === PHASES.ended && (
          <Card className="mx-auto max-w-xl text-center">
            <h2 className="text-xl font-semibold text-primary">{t.completeTitle}</h2>
            <p className="mt-2 text-primary/70">{t.completeBody}</p>

            {notes.length > 0 && (
              <div className="mt-6 rounded-lg bg-surface p-4 text-left">
                <p className="text-sm font-medium text-primary">{t.presenceTitle}</p>
                <p className="mt-1 text-xs text-primary/60">{t.presenceCaveat}</p>
                <ul className="mt-3 space-y-2">
                  {notes.map((note) => (
                    <li key={note} className="flex gap-3 text-sm text-primary/80">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button as={Link} to="/passport" variant="accent">
                {t.viewPassport}
              </Button>
              <Button variant="outline" onClick={backToLobby}>
                {t.startAnother}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  )
}

/**
 * A failure the candidate can act on.
 *
 * A microphone fault is named by where the fix actually lives, which is not
 * always the browser: on Windows the OS privacy setting refuses first, and the
 * browser reports that as the unhelpful "Permission denied by system".
 */
function ErrorNotice({ error, mediaError }) {
  const t = strings.interview
  const fault = mediaError ? classifyMediaError(mediaError) : null

  return (
    <Card className="border-accent/40 bg-accent/10">
      <h2 className="font-semibold text-primary">{fault ? t.micTitle : t.errorTitle}</h2>
      <p className="mt-1 whitespace-pre-line text-sm text-primary/70">
        {fault ? t.micFaults[fault] : (error?.message ?? String(error))}
      </p>
    </Card>
  )
}

/** The camera failed but the interview did not: said plainly, and not as an error. */
function CameraNotice({ fault }) {
  const t = strings.interview

  return (
    <Card className="border-primary/10">
      <h2 className="flex items-center gap-2 font-semibold text-primary">
        <CallIcon name="cameraOff" className="h-5 w-5 shrink-0 text-primary/60" />
        {t.cameraOffTitle}
      </h2>
      <p className="mt-1 text-sm text-primary/70">{t.cameraFaults[fault]}</p>
      <p className="mt-2 text-sm text-primary/60">{t.cameraOffBody}</p>
    </Card>
  )
}
