/**
 * UI strings kept out of components so Amharic, Afaan Oromoo, and Tigrinya can be
 * added later without touching markup. Import `strings`, never inline copy.
 */
export const strings = {
  interview: {
    pageEyebrow: 'AI mock interview',
    pageTitle: 'Video Mock Interview',
    pageSubtitle:
      'Answer role-specific questions on camera and get scored on clarity, confidence, and STAR structure. Every score feeds your Skill Passport.',
    setupTitle: 'Practice interview',
    setupBody: 'Pick the role you are preparing for. Questions are matched to it.',
    setupStart: 'Continue',
    consentTitle: 'Before we start recording',
    consentBody:
      'This session records your camera and microphone so your answers can be scored. Recording only runs while you choose to record an answer.',
    consentPoints: [
      'Your recording stays on this device — only the text of your answer is sent for scoring.',
      'You can stop a recording at any time, and re-record an answer before submitting it.',
      'Nothing is captured until you press Record.',
    ],
    consentAccept: 'I agree, start the session',
    consentDecline: 'Not now',
    consentDeclined: 'No problem — the session was not started and nothing was recorded.',
    loadingQuestions: 'Loading your questions…',
    questionProgress: 'Question {current} of {total}',
    record: 'Record',
    stop: 'Stop',
    rerecord: 'Re-record',
    recording: 'Recording',
    cameraOff: 'Your camera preview appears here once you start recording.',
    transcriptLabel: 'Your answer',
    transcriptHint:
      'Automatic transcription is not wired up yet, so type or paste what you said to get it scored.',
    transcriptPlaceholder: 'Type your answer here…',
    submit: 'Submit for scoring',
    submitting: 'Scoring your answer…',
    feedbackTitle: 'Feedback on this answer',
    scoreClarity: 'Clarity',
    scoreConfidence: 'Confidence',
    scoreStar: 'STAR structure',
    strengths: 'What worked',
    improvements: 'What to change',
    next: 'Next question',
    finish: 'Finish session',
    completeTitle: 'Session complete',
    completeBody: 'Your scores have been added to your Skill Passport.',
    viewPassport: 'View Skill Passport',
    startAnother: 'Practice again',
    errorTitle: 'Something went wrong',
    errorRetry: 'Try again',
    errorNoTranscript: 'Add your answer before submitting it for scoring.',
    errorCamera:
      'We could not reach your camera or microphone. Check your browser permissions and try again.',
  },
}

/** Fills `{name}` placeholders, e.g. format(s.questionProgress, { current: 1, total: 5 }). */
export function format(template, values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template
  )
}
