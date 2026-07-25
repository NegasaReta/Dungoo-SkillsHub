import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'

import AppShell from '../components/app/AppShell.jsx'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import Loader from '../components/common/Loader.jsx'
import ConsentGate from '../components/interview/ConsentGate.jsx'
import LiveFeedback from '../components/interview/LiveFeedback.jsx'
import QuestionCard from '../components/interview/QuestionCard.jsx'
import RecorderControls from '../components/interview/RecorderControls.jsx'
import TranscriptInput from '../components/interview/TranscriptInput.jsx'
import VideoPreview from '../components/interview/VideoPreview.jsx'
import RoleSelect from '../components/onboarding/RoleSelect.jsx'
import useMediaRecorder from '../hooks/useMediaRecorder.js'
import { completeSession, createSession, fetchQuestions, submitResponse } from '../api/index.js'
import { useUser } from '../context/UserContext.jsx'
import { ROLES } from '../constants.js'
import { strings } from '../i18n/en.js'

const PHASES = {
  setup: 'setup',
  consent: 'consent',
  loading: 'loading',
  answering: 'answering',
  feedback: 'feedback',
  complete: 'complete',
  declined: 'declined',
}

export default function InterviewSession() {
  const t = strings.interview
  const { user } = useUser()

  const [phase, setPhase] = useState(PHASES.setup)
  const [role, setRole] = useState(ROLES[0].slug)
  const [session, setSession] = useState(null)
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState(null)

  const recorder = useMediaRecorder({ audio: true, video: true })
  const question = questions[index]
  const isLastQuestion = index === questions.length - 1

  const beginSession = useCallback(async () => {
    setPhase(PHASES.loading)
    setError(null)
    try {
      const [bank, created] = await Promise.all([
        fetchQuestions(role),
        createSession({ userId: user?.id, role }),
      ])
      setQuestions(bank)
      setSession(created)
      setIndex(0)
      setPhase(PHASES.answering)
    } catch (cause) {
      setError(cause)
      setPhase(PHASES.setup)
    }
  }, [role, user?.id])

  const submit = useCallback(async () => {
    if (!transcript.trim()) {
      setError(new Error(t.errorNoTranscript))
      return
    }

    setPhase(PHASES.loading)
    setError(null)
    try {
      const report = await submitResponse(session.id, {
        questionId: question.id,
        transcript: transcript.trim(),
      })
      setFeedback(report)
      setPhase(PHASES.feedback)
    } catch (cause) {
      setError(cause)
      setPhase(PHASES.answering)
    }
  }, [question, session, transcript, t.errorNoTranscript])

  const goNext = useCallback(async () => {
    recorder.reset()
    setTranscript('')
    setFeedback(null)

    if (!isLastQuestion) {
      setIndex((value) => value + 1)
      setPhase(PHASES.answering)
      return
    }

    setPhase(PHASES.loading)
    try {
      await completeSession(session.id)
      setPhase(PHASES.complete)
    } catch (cause) {
      setError(cause)
      setPhase(PHASES.feedback)
    }
  }, [isLastQuestion, recorder, session])

  const restart = useCallback(() => {
    recorder.reset()
    setSession(null)
    setQuestions([])
    setIndex(0)
    setTranscript('')
    setFeedback(null)
    setError(null)
    setPhase(PHASES.setup)
  }, [recorder])

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-5">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-link">
            {t.pageEyebrow}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-primary">{t.pageTitle}</h1>
          <p className="mt-2 text-sm text-primary/60">{t.pageSubtitle}</p>
        </header>

        {error && <ErrorNotice error={error} cameraError={recorder.error} />}

        {phase === PHASES.setup && (
          <Card className="mx-auto max-w-xl">
            <h1 className="text-xl font-semibold text-primary">{t.setupTitle}</h1>
            <p className="mt-2 text-primary/70">{t.setupBody}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <RoleSelect roles={ROLES} value={role} onChange={setRole} />
              <Button variant="accent" onClick={() => setPhase(PHASES.consent)}>
                {t.setupStart}
              </Button>
            </div>
          </Card>
        )}

        {phase === PHASES.consent && (
          <ConsentGate onAccept={beginSession} onDecline={() => setPhase(PHASES.declined)} />
        )}

        {phase === PHASES.declined && (
          <Card className="mx-auto max-w-xl">
            <p className="text-primary/70">{t.consentDeclined}</p>
            <Button className="mt-5" variant="outline" onClick={restart}>
              {t.errorRetry}
            </Button>
          </Card>
        )}

        {phase === PHASES.loading && (
          <Card className="mx-auto max-w-xl">
            <Loader label={session ? t.submitting : t.loadingQuestions} />
          </Card>
        )}

        {(phase === PHASES.answering || phase === PHASES.feedback) && question && (
          <>
            <QuestionCard index={index} total={questions.length} question={question} />

            <Card className="space-y-5">
              <VideoPreview stream={recorder.stream} blobUrl={recorder.blobUrl} />
              <RecorderControls
                isRecording={recorder.isRecording}
                hasRecording={Boolean(recorder.blobUrl)}
                seconds={recorder.seconds}
                onStart={recorder.start}
                onStop={recorder.stop}
              />
              <TranscriptInput
                value={transcript}
                onChange={setTranscript}
                disabled={phase === PHASES.feedback}
              />
              {phase === PHASES.answering && (
                <Button variant="accent" onClick={submit}>
                  {t.submit}
                </Button>
              )}
            </Card>
          </>
        )}

        {phase === PHASES.feedback && (
          <>
            <LiveFeedback feedback={feedback} />
            <Button variant="accent" onClick={goNext}>
              {isLastQuestion ? t.finish : t.next}
            </Button>
          </>
        )}

        {phase === PHASES.complete && (
          <Card className="mx-auto max-w-xl text-center">
            <h2 className="text-xl font-semibold text-primary">{t.completeTitle}</h2>
            <p className="mt-2 text-primary/70">{t.completeBody}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button as={Link} to="/passport" variant="accent">
                {t.viewPassport}
              </Button>
              <Button variant="outline" onClick={restart}>
                {t.startAnother}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  )
}

function ErrorNotice({ error, cameraError }) {
  const t = strings.interview
  const message = cameraError ? t.errorCamera : (error.response?.data?.detail ?? error.message)

  return (
    <Card className="border-accent/40 bg-accent/10">
      <h2 className="font-semibold text-primary">{t.errorTitle}</h2>
      <p className="mt-1 text-sm text-primary/70">{message}</p>
    </Card>
  )
}
