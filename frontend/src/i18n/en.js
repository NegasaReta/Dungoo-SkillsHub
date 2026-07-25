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

  landing: {
    nav: {
      links: [
        { href: '#how-it-works', label: 'How it works' },
        { href: '#features', label: 'Features' },
        { href: '#passport', label: 'Skill Passport' },
        { href: '#why', label: 'Why Dungoo' },
      ],
      login: 'Log in',
      signup: 'Start practicing',
      toggle: 'Toggle navigation',
    },

    hero: {
      badge: 'Built in Ethiopia, for Ethiopian youth',
      titleLead: 'Your qualifications are ready.',
      titleAccent: 'Now get your confidence there too.',
      body: 'Practice real interviews on camera, get scored on clarity, confidence, and STAR structure in seconds, and turn every session into a Skill Passport employers can trust.',
      primaryCta: 'Start a mock interview',
      secondaryCta: 'See how it works',
      trust: [
        'Free to start',
        'Works on low-bandwidth connections',
        'Amharic, Afaan Oromoo, Tigrinya & English',
      ],
      cardQuestion: 'Question 2 of 5',
      cardRecording: 'Recording',
      cardPrompt: '“Tell me about a problem you solved that others on your team had missed.”',
      cardFeedback:
        'Strong result and a clear outcome. Next time, name the specific metric you improved so the impact lands faster.',
      passportChip: 'Skill Passport updated',
      liveChip: 'Scored in 4s',
    },

    stats: {
      title: 'The gap isn’t ambition. It’s',
      titleAccent: 'soft skills',
      body: 'Ethiopia is growing without creating matching opportunity — a classic jobless-growth pattern. Rote-memorisation education leaves graduates without professional English fluency or interview confidence, even when their technical qualifications are sound.',
      items: [
        { value: '~7%', label: 'GDP growth', detail: 'Ethiopia’s economy keeps expanding.' },
        {
          value: '~27%',
          label: 'Urban youth unemployment',
          detail: 'Yet capable graduates stay unhired.',
        },
        {
          value: '0',
          label: 'Affordable coaching at scale',
          detail: 'Private training centres price youth out.',
        },
      ],
    },

    steps: {
      eyebrow: 'How it works',
      title: 'One practice loop, from first answer to shareable credential',
      items: [
        {
          title: 'Tell us your goal',
          body: 'A two-minute sign-up captures your name, target role, and language profile. No CV upload, no fees.',
        },
        {
          title: 'Practice on camera',
          body: 'Answer role-matched interview questions in the browser. Record, review, and retry as often as you like.',
        },
        {
          title: 'Get scored in seconds',
          body: 'The AI rates every answer on clarity, confidence, and STAR structure, with specific notes on what to change.',
        },
        {
          title: 'Build your Skill Passport',
          body: 'Each session feeds a persistent credential that shows your growth and gives employers a readiness signal.',
        },
      ],
    },

    showcase: {
      eyebrow: 'Inside a session',
      title: 'Your answer, scored while it is still fresh',
      body: 'You answer one question at a time on camera. The AI reads the answer back to you: how clearly you spoke, how confident you sounded, and whether the story followed the STAR structure employers listen for.',
      points: [
        'Clarity and confidence scored from your own answer, not a generic template.',
        'Feedback in seconds, so you can retry while the question is still fresh.',
        'Every completed session adds to the Skill Passport you can share.',
      ],
      caption: 'Illustration of a practice session being scored.',
      alt: 'A candidate answering an interview question, with panels around her showing a clarity waveform, an AI score, and badges being added to a Skill Passport.',
    },

    features: {
      eyebrow: 'Features',
      title: 'One integrated platform, not another single-purpose app',
      items: [
        {
          icon: 'mic',
          title: 'AI video mock interviews',
          body: 'Role-matched questions, in-browser recording, and per-answer scoring on clarity, confidence, and STAR structure.',
          status: 'Available now',
        },
        {
          icon: 'passport',
          title: 'Skill Passport',
          body: 'Every session aggregates into one persistent, shareable credential that proves what you can actually do.',
          status: 'Available now',
        },
        {
          icon: 'chart',
          title: 'Progress dashboard',
          body: 'Track score growth across sessions so you can see exactly which skill moved and which one stalled.',
          status: 'Available now',
        },
        {
          icon: 'users',
          title: 'Peer language exchange',
          body: 'Trade the language you know for the one you want, across Amharic, Afaan Oromoo, Tigrinya, and English.',
          status: 'Coming soon',
        },
        {
          icon: 'chat',
          title: 'AI communication practice',
          body: 'Guided professional-English exercises with instant corrections tuned to Ethiopian-accented speech.',
          status: 'Coming soon',
        },
        {
          icon: 'store',
          title: 'Verified expert marketplace',
          body: 'Book vetted language teachers, industry professionals, and trainers for live paid sessions.',
          status: 'Phase 2',
        },
      ],
    },

    passport: {
      eyebrow: 'Skill Passport',
      title: 'Proof you can point to, not a promise you have to make',
      body: 'Employers can’t interview everyone, so capable youth stay invisible. The Skill Passport turns your practice history into a verifiable credential — one link that shows what you have worked on and how far you have come.',
      benefits: [
        'Built automatically from real practice sessions, not self-reported claims.',
        'Shows growth over time, so effort is visible even before the first job offer.',
        'Gives employers a readiness signal for candidates they would otherwise never screen.',
      ],
      cardLabel: 'Skill Passport',
      cardRole: 'Junior Software Engineer',
      cardAverage: '{score} / {max} avg',
      cardSessions: '6 sessions completed',
      cardVerified: 'Verified by Dungoo',
    },

    why: {
      eyebrow: 'Why Dungoo',
      title: 'Locally built, because imported tools don’t fit',
      items: [
        {
          title: 'Built for Ethiopia, not adapted for it',
          body: 'Global tools like Yoodli and Huru are designed for US and UK job markets and priced in dollars. SkillsHub is built ground-up for Ethiopian accents, languages, and workplace norms.',
        },
        {
          title: 'One platform, not a point tool',
          body: 'Language-exchange apps stop at conversation. SkillsHub combines peer practice with structured interview and soft-skills training in a single place.',
        },
        {
          title: 'True multi-language matching',
          body: 'Matching reflects how Ethiopians actually communicate — across Amharic, Afaan Oromoo, Tigrinya, and English, not a single language pair.',
        },
        {
          title: 'It closes the loop on both sides',
          body: 'Youth get affordable practice that scales. Employers get a verified readiness signal they can hire against.',
        },
      ],
    },

    cta: {
      title: 'Your next interview can be your best one',
      body: 'Start with one mock interview. Get scored in seconds, see exactly what to fix, and leave with the first entry in your Skill Passport.',
      primary: 'Start practicing free',
      secondary: 'Learn more',
    },

    footer: {
      tagline:
        'AI-powered career readiness for Ethiopian youth. A product of Dungoo Software Solutions.',
      languagesTitle: 'Available in',
      languages: ['Amharic', 'Afaan Oromoo', 'Tigrinya', 'English'],
      platformTitle: 'Platform',
      rights: '© {year} Dungoo Software Solutions. All rights reserved.',
    },

    scoreLabels: {
      clarity: 'Clarity',
      confidence: 'Confidence',
      star: 'STAR structure',
    },
  },

  theme: {
    legend: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode',
    description: 'Choose how Dungoo SkillsHub looks. System follows your device setting.',
  },

  topbar: {
    searchLabel: 'Search skills, coaches, or lessons',
    searchPlaceholder: 'Search skills, coaches, or lessons...',
    searchEmpty: 'No matches yet. Try “interview”, “passport”, or “analytics”.',
    openNavigation: 'Open navigation',
    closeNavigation: 'Close navigation',
    explore: 'Explore',
    community: 'Community',
    help: 'Help and shortcuts',
    account: 'Account menu',
  },

  help: {
    title: 'Help & quick links',
    startInterview: 'Start a practice interview',
    viewPassport: 'View your Skill Passport',
    editProfile: 'Update your profile',
    shortcutsTitle: 'Handy to know',
    shortcuts: [
      'Recordings never leave your device — only the answer text is scored.',
      'Press Esc to close any menu.',
      'Switch between light and dark from your profile menu.',
    ],
  },

  account: {
    menuLabel: 'Account',
    viewProfile: 'Profile and settings',
    appearance: 'Appearance',
    signOut: 'Sign out',
    signedInAs: 'Signed in as',
  },

  notifications: {
    label: 'Notifications',
    title: 'Notifications',
    markAllRead: 'Mark all as read',
    empty: 'You are all caught up.',
    signedOut: 'Log in to see your notifications.',
    unreadCount: '{count} unread',
    viewAll: 'View all activity',
    welcomeTitle: 'Welcome to Dungoo SkillsHub',
    welcomeBody:
      'Your account is ready. Practice interviews are scored on clarity, confidence, and STAR structure.',
    profileTodoTitle: 'Finish your profile',
    profileTodoBody:
      'Add your education, industries, and languages so questions match your field.',
    profileTodoAction: 'Complete profile',
    profileDoneTitle: 'Your profile is complete',
    profileDoneBody: 'Questions and scoring are now tailored to the industries you chose.',
    practiceTitle: 'Ready for your first practice interview',
    practiceBody:
      'Answer one question at a time and get feedback immediately after each one.',
    practiceAction: 'Start a session',
  },

  settings: {
    title: 'Settings',
    subtitle: 'Manage your profile, photo, and how the app looks.',
    photoTitle: 'Profile photo',
    photoBody:
      'Your photo stays on this device — it is never uploaded to our servers.',
    photoUpload: 'Upload photo',
    photoReplace: 'Replace photo',
    photoRemove: 'Remove',
    photoHint: 'PNG, JPG, or WebP up to 5MB. Square images look best.',
    photoSaved: 'Profile photo updated.',
    photoRemoved: 'Profile photo removed.',
    appearanceTitle: 'Appearance',
  },

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
