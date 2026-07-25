/**
 * UI strings kept out of components so Amharic, Afaan Oromoo, and Tigrinya can be
 * added later without touching markup. Import `strings`, never inline copy.
 */
export const strings = {
  interview: {
    lobbyTitle: 'Interview room',
    lobbySubtitle: 'Dungoo AI interviewer is waiting to join',
    lobbyBody:
      'This runs like a real interview call: the AI interviewer asks a question out loud, you answer out loud, and it moves on when you finish. Pick the role you are preparing for.',
    joinRoom: 'Join now',
    joining: 'Joining the room…',
    interviewerName: 'Dungoo AI interviewer',
    interviewerCameraOff: 'Camera off',
    youName: 'You',
    yourCameraOff: 'Your camera is off',
    consentPoints: [
      'Your camera is only shown to you and analysed on this device — no video is recorded or uploaded.',
      'Only your spoken answers leave this device, as audio, so they can be transcribed and scored.',
      'Nothing is captured until you join, and leaving the room ends the capture.',
    ],
    consentCheckbox:
      'I agree to my microphone and camera being used for this practice session on these terms.',
    consentDecline: 'Not now',
    speaking: 'Interviewer is speaking…',
    loadingAudio: 'Interviewer is joining the audio…',
    voiceUnavailable:
      'The interviewer has no voice on this connection — read each question on screen and answer as normal.',
    listening: 'Your turn — just speak, we stop when you do',
    micMuted: 'Your mic is muted — unmute to answer',
    transcribing: 'Transcribing…',
    wrappingUp: 'Wrapping up…',
    turnProgress: 'Question {current} of {total}',
    finalTurn: 'Last question',
    captionsTitle: 'Live captions',
    captionsEmpty: 'Captions appear here as the conversation goes on.',
    captionsShow: 'Show captions',
    captionsHide: 'Hide captions',
    muteMic: 'Mute microphone',
    unmuteMic: 'Unmute microphone',
    cameraOnAction: 'Turn camera on',
    cameraOffAction: 'Turn camera off',
    leaveCall: 'Leave interview',
    presenceTitle: 'How you came across on camera',
    presenceCaveat:
      'Observations only — these never affect your scores. Interview norms differ between cultures, so take what is useful and leave the rest.',
    completeTitle: 'Interview complete',
    completeBody:
      'Your answers have been scored and added to your Skill Passport.',
    viewPassport: 'View Skill Passport',
    startAnother: 'Practice again',
    errorTitle: 'Something went wrong',
    errorNoRecording: 'We did not catch any audio for that answer.',
    errorTranscription: 'We could not turn that answer into text. Carrying on with the interview.',
    errorCamera:
      'We could not reach your camera or microphone. Check your browser permissions and try again.',
    errorNotSignedIn: 'Sign in before starting an interview.',
  },

  passport: {
    title: 'Skill Passport',
    subtitle: 'Built from your practice interviews — not from what you say about yourself.',
    holderLabel: 'Candidate',
    holderUnknown: 'Add your name',
    roleLabel: 'Practising for',
    overallLabel: 'Overall readiness',
    verified: 'Verified by Dungoo',
    sessions: '{count} interviews completed',
    answers: '{count} answers scored',
    updated: 'Updated {date}',
    notScored: 'Not scored yet',
    // Keyed by the level ids the API sends, so the bands can be translated.
    levels: {
      not_scored: 'Not scored yet',
      emerging: 'Emerging',
      developing: 'Developing',
      interview_ready: 'Interview ready',
      standout: 'Standout',
    },
    levelHints: {
      not_scored: 'Finish one interview and your first scores land here.',
      emerging: 'You are getting your answers out. Next: give them a shape.',
      developing: 'Your answers hold together. Tighten the results you name.',
      interview_ready: 'You are answering at the level a real interview expects.',
      standout: 'Clear, confident, complete answers. Keep them sharp.',
    },
    skills: {
      clarity: 'Clarity',
      confidence: 'Confidence',
      star: 'STAR structure',
    },
    skillHints: {
      clarity: 'How easy your answer is to follow',
      confidence: 'How much you own the work you describe',
      star: 'Situation, Task, Action, Result',
    },
    breakdownTitle: 'Skill breakdown',
    shapeTitle: 'Your skill shape',
    strengthsTitle: 'What you are doing well',
    focusTitle: 'What to work on next',
    notesEmpty: 'Feedback lands here after your first scored interview.',
    milestonesTitle: 'Milestones',
    milestones: {
      first_session: 'First interview completed',
      three_sessions: 'Three interviews completed',
      all_skills_strong: 'Every skill at 4.0 or above',
    },
    historyTitle: 'Practice history',
    historyAnswers: '{count} answers',
    emptyTitle: 'Your passport starts with one interview',
    emptyBody:
      'Sit a mock interview and the scores, feedback, and milestones from it become the first entry in your Skill Passport.',
    emptyAction: 'Start a mock interview',
    loading: 'Building your passport…',
    errorTitle: 'We could not load your passport',
    retry: 'Try again',
    practiseAgain: 'Practise again',
  },
}

/** Fills `{name}` placeholders, e.g. format(s.turnProgress, { current: 1, total: 5 }). */
export function format(template, values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template
  )
}
