/**
 * UI strings kept out of components so Amharic, Afaan Oromoo, and Tigrinya can be
 * added later without touching markup. Import `strings`, never inline copy.
 */
export const strings = {
  resources: {
    eyebrow: 'Library',
    title: 'Resource Library',
    subtitle:
      'Guides and drills for interviews, professional English, and workplace communication. Everything here is readable in the app.',
    searchLabel: 'Search resources',
    searchPlaceholder: 'Search guides and drills…',
    topicsLabel: 'Topic',
    featured: 'Featured guide',
    startReading: 'Start reading',
    read: 'Read',
    close: 'Close',
    print: 'Print or save as PDF',
    minutesRead: '{minutes} min read',
    minutesPractice: '{minutes} min practice',
    watch: 'Watch',
    watchNote: 'Plays here from YouTube. Nothing loads until you open it.',
    openOnYoutube: 'Open on YouTube',
    videoBy: 'By {channel}',
    empty: 'Nothing matches that search yet.',
    emptyHint: 'Try a different word, or clear the topic filter.',
    clearFilters: 'Clear filters',
    planTitle: 'Where to start',
    planScored: 'Your weakest axis is {axis}, so these come first.',
    planUnscored:
      'Once you have a scored interview answer, this list reorders itself around your weakest axis.',
    planFallback: 'A reasonable order for anyone preparing from scratch.',
    resultCount: '{count} resource',
    resultCountPlural: '{count} resources',
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
