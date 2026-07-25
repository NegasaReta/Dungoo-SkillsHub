/**
 * UI strings kept out of components so Amharic, Afaan Oromoo, and Tigrinya can be
 * added later without touching markup. Import `strings`, never inline copy.
 */
export const strings = {
  notifications: {
    title: 'Notifications',
    markAllRead: 'Mark all as read',
    caughtUp: 'You are all caught up.',
    signedOut: 'Log in to see your notifications.',
    welcomeTitle: 'Welcome to Dungoo SkillsHub',
    welcomeBody: 'Your account is ready. Practice interviews are scored on clarity, confidence, and STAR structure.',
    profileTodoTitle: 'Finish your profile',
    profileTodoBody: 'Add your education, industries, and languages so questions match your field.',
    profileTodoAction: 'Complete profile',
    profileDoneTitle: 'Your profile is complete',
    profileDoneBody: 'Questions and scoring are now tailored to the industries you chose.',
    practiceTitle: 'Ready for your first practice interview',
    practiceBody: 'Answer one question at a time and get feedback immediately after each one.',
    practiceAction: 'Start a session',
  },
  help: {
    title: 'Help & support',
    intro: 'Short answers to the things people ask first.',
    practice: 'Practice an interview',
    practiceBody: 'One question at a time, scored as you go.',
    passport: 'Your Skill Passport',
    passportBody: 'How your scores add up into one credential.',
    howItWorks: 'How Dungoo works',
    howItWorksBody: 'The three-step tour on our home page.',
    account: 'Profile & account settings',
    accountBody: 'Update your details or sign out.',
    shortcut: 'Press Esc to close any menu.',
  },
  interview: {
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
