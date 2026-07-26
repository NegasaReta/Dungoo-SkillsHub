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
      cardImageAlt: 'A young Ethiopian woman answering an interview question on camera',
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
      productTitle: 'Product',
      companyTitle: 'Company',
      legalTitle: 'Legal',
      product: [
        { to: '/interview', label: 'AI Interview' },
        { to: '/passport', label: 'Skill Passport' },
        { to: '/matching', label: 'Peer Learning' },
        { to: '/analytics', label: 'Analytics' },
        { to: '/resources', label: 'Resources' },
      ],
      company: [
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
      ],
      legal: [
        { to: '/privacy', label: 'Privacy' },
        { to: '/terms', label: 'Terms' },
      ],
      rights: '© {year} Dungoo Software Solutions. All rights reserved.',
    },

    scoreLabels: {
      clarity: 'Clarity',
      confidence: 'Confidence',
      star: 'STAR structure',
    },
  },

  /*
   * The pages the footer links out to. Everything the privacy page claims is
   * checkable in the code: video stays on the device (useEngagementTracker posts
   * a summary, never frames), answer audio is transcribed and only the text is
   * stored (InterviewTurn.transcript), and the three providers named are the ones
   * app/services actually calls.
   */
  site: {
    label: 'dungoosolutions.com',
    href: 'https://www.dungoosolutions.com',
  },

  /* Shared by the footer and the contact page. `handle` is what a reader sees. */
  social: {
    title: 'Follow along',
    links: [
      {
        id: 'facebook',
        label: 'Facebook',
        handle: 'Dungoo Software Solutions',
        href: 'https://www.facebook.com/people/Dungoo-Software-Solutions/61578495791355/',
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        handle: 'Dungoo Software Solutions',
        href: 'https://www.linkedin.com/company/112508380',
      },
      {
        id: 'x',
        label: 'X',
        handle: '@dungoosolutions',
        href: 'https://x.com/dungoosolutions',
      },
      {
        id: 'instagram',
        label: 'Instagram',
        handle: '@dungoosolutions',
        href: 'https://www.instagram.com/dungoosolutions',
      },
      {
        id: 'telegram',
        label: 'Telegram',
        handle: '@dungoosolutions',
        href: 'https://t.me/dungoosolutions',
      },
    ],
  },

  pages: {
    // Right domain, but the mailbox names are still assumed — confirm both exist
    // before launch, or point them at an inbox that does.
    supportEmail: 'hello@dungoosolutions.com',
    privacyEmail: 'privacy@dungoosolutions.com',
    updated: 'Last updated July 2026',
    contactNote: 'Anything we have not answered here:',
    contactNoteLink: 'get in touch',

    about: {
      eyebrow: 'About',
      title: 'Career readiness for Ethiopian youth',
      lead: 'Dungoo SkillsHub is where you practise the conversation that decides the job — on camera, in your own time, with feedback specific enough to act on.',
      sections: [
        {
          title: 'Why we built it',
          body: [
            'Ethiopia’s economy has grown at around 7% a year while youth unemployment stayed high. The gap is rarely technical qualification. It is the interview itself: professional English under pressure, structuring an answer so it lands, and the confidence that only comes from having done it before.',
            'An education that rewards memorisation gives nobody that practice. A candidate can be entirely qualified and still lose the role in the first ten minutes.',
          ],
        },
        {
          title: 'What the platform does',
          list: [
            'AI Interview — a spoken interview drawn from a fixed question bank for your role. Every answer is scored 1 to 5 on clarity, confidence, and STAR structure, with a line of feedback per axis.',
            'Peer Learning — forty minutes a day of language exchange, matched both ways across Amharic, Afaan Oromoo, Tigrinya, and English. They practise what you speak, you practise what they speak.',
            'Skill Passport — every scored session builds one credential page showing where you started, where you are now, and what you have finished.',
            'Analytics and Resources — your score history over time, and guides and drills aimed at whichever axis is weakest.',
          ],
        },
        {
          title: 'How the scoring works',
          body: [
            'Questions come from a fixed bank per role rather than being invented on the spot, so two people practising the same role sit the same interview. Your spoken answer is transcribed, then scored against the question it answered.',
            'Those scores are practice feedback, not an accreditation. They are useful because they are consistent and specific, not because anyone has certified them.',
          ],
        },
        {
          title: 'Where we are',
          body: [
            'This is an early build. The interview room, Skill Passport, analytics, and resource library work end to end. Peer Learning is a preview running against a demo pool of partners. A marketplace and employer-side verification are on the roadmap, not in the product — we would rather show you four things that work than twelve that nearly do.',
          ],
        },
        {
          title: 'Who we are',
          body: [
            'SkillsHub is a product of Dungoo Software Solutions, built in Ethiopia for people entering the Ethiopian job market.',
          ],
        },
      ],
    },

    privacy: {
      eyebrow: 'Privacy',
      title: 'Privacy policy',
      lead: 'The short version: your video never leaves your device, your answer audio is transcribed and then dropped, and we keep the text and the scores because that is what your Skill Passport is made of.',
      sections: [
        {
          title: 'What we collect',
          list: [
            'Account details — your name, your email address, and your password stored only as a bcrypt hash. The password itself is never written down anywhere we can read it.',
            'Profile details — target role, industry, education level, the languages you speak, and the ones you want to practise.',
            'Practice data — the transcript of each answer, the scores and feedback written for it, when the session ran, and a summary of how you held the camera.',
          ],
        },
        {
          title: 'Your camera and your recordings',
          list: [
            'Video is never uploaded. The camera feed is analysed on your own device, and only a numeric summary — how steadily you stayed in frame and held eye contact — is sent when the session ends.',
            'Audio of a spoken answer is uploaded so it can be transcribed. The transcript is stored; the audio is not written to our database.',
            'Nothing is captured until you tick the consent box and join the room, and leaving the room ends the capture.',
          ],
        },
        {
          title: 'Services we send data to',
          body: [
            'Running this in a browser means some steps happen elsewhere. Each service receives only what that step needs, and none of them receive your email address, your password, or anything identifying you beyond the answer itself.',
          ],
          list: [
            'ElevenLabs — transcribes a recorded answer, and gives the interviewer its voice.',
            'Addis Assistant — transcribes answers spoken in Ethiopian languages.',
            'Google Gemini — scores a transcript against the question it answered, and writes the interviewer’s short lead-in lines.',
          ],
        },
        {
          title: 'How long we keep it',
          body: [
            'Your account and practice data stay until you ask us to remove them. Self-serve deletion has not shipped yet, so for now write to us and we will delete the account and everything attached to it.',
          ],
        },
        {
          title: 'How it is protected',
          body: [
            'Traffic runs over HTTPS. Passwords are hashed with bcrypt, sign-in uses signed tokens that expire, and every interview endpoint checks that the session belongs to whoever is asking before it answers.',
            'This is an early product from a small team, and it has not been through an external security audit. We would rather say so than imply otherwise.',
          ],
        },
      ],
    },

    terms: {
      eyebrow: 'Terms',
      title: 'Terms of use',
      lead: 'Plain language, because you should not need a lawyer to know what you agreed to.',
      sections: [
        {
          title: 'The service',
          body: [
            'Dungoo SkillsHub gives you interview practice, peer language exchange, and a record of both. It is provided by Dungoo Software Solutions, as it is, while it is still being built.',
          ],
        },
        {
          title: 'Your account',
          list: [
            'Use an email address you control, and keep your password to yourself. Anything done through your account is treated as done by you.',
            'You need to be at least 16, or to have a parent or guardian’s permission.',
            'One person per account. Shared logins make the scores meaningless anyway.',
          ],
        },
        {
          title: 'Practising with other people',
          list: [
            'A peer session is between two people who both chose to be there. Do not record your partner, and do not submit someone else’s voice as your answer.',
            'Harassment, hate speech, or using a session to sell something ends the account.',
          ],
        },
        {
          title: 'What your scores mean',
          body: [
            'The Skill Passport is a record of practice. It shows what you did and how our model scored it. It is not a qualification, an accreditation, or a promise of employment, and we do not present it to anyone as one.',
            'Scores come from an AI model, so some of them will be wrong. Treat a score as a coach’s opinion rather than a verdict.',
          ],
        },
        {
          title: 'Availability',
          body: [
            'Features arrive, change, and occasionally break. We do not promise uptime, and a session can fail when a speech or scoring provider is unavailable.',
          ],
        },
        {
          title: 'Ending things',
          body: [
            'You can stop using SkillsHub whenever you like and ask us to delete your account. We can suspend an account that breaks these terms.',
          ],
        },
        {
          title: 'Changes and governing law',
          body: [
            'If these terms change in a way that matters, we will say so here and move the date at the top. They are governed by the laws of the Federal Democratic Republic of Ethiopia.',
          ],
        },
      ],
    },

    contact: {
      eyebrow: 'Contact',
      title: 'Talk to us',
      lead: 'A small team building this in Addis Ababa. Real replies, usually within a few working days.',
      channels: [
        {
          title: 'Support',
          body: 'Something broke, a score looked wrong, or a session would not start.',
          kind: 'support',
        },
        {
          title: 'Privacy and your data',
          body: 'Ask what we hold about you, or ask us to delete it.',
          kind: 'privacy',
        },
      ],
      locationTitle: 'Where we are',
      location: 'Addis Ababa, Ethiopia',
      ctaTitle: 'Not a question — you just want to try it?',
      ctaBody: 'Signing up takes a minute, and the first mock interview takes about ten.',
      ctaAction: 'Create an account',
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

  sidebar: {
    ctaTitle: 'Ready to practise?',
    ctaBody: 'One mock interview takes about ten minutes and updates your Skill Passport.',
    ctaAction: 'Start AI Interview',
  },

  topbar: {
    // The search jumps between pages and actions, so the copy says that rather
    // than promising coaches and lessons it cannot find.
    searchLabel: 'Search pages and actions',
    searchPlaceholder: 'Jump to a page or action…',
    searchEmpty: 'Nothing matches. Try “interview”, “passport”, or “analytics”.',
    searchHint: 'Use the arrow keys to choose, Enter to open.',
    searchResults: 'Search results',
    openNavigation: 'Open navigation',
    closeNavigation: 'Close navigation',
    navigation: 'Main navigation',
    skipToContent: 'Skip to main content',
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
      'Press Ctrl+K (⌘K on Mac) to jump to any page.',
      'Press Esc to close any menu.',
      'Switch between light and dark from your profile menu.',
    ],
  },

  account: {
    menuLabel: 'Account',
    manageAccount: 'Manage account',
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

  practice: {
    eyebrow: 'Communication practice',
    title: 'AI Trainer',
    subtitle:
      'Hold a professional conversation and get your grammar, vocabulary, and tone corrected as you go.',
  },

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
    errorNotSignedIn: 'Sign in before starting an interview.',

    // The microphone is the interview: without it there is nothing to answer with.
    micTitle: 'We cannot reach your microphone',
    micFaults: {
      systemBlocked:
        'Windows is blocking microphone access for your browser, so the site permission is not enough on its own. Open Settings → Privacy → Microphone, turn on "Allow apps to access your microphone" and the desktop apps switch below it, then reload this page.',
      siteBlocked:
        'This site is not allowed to use your microphone. Click the padlock in the address bar, set Microphone to Allow, then reload this page.',
      notFound:
        'No microphone is attached. Plug one in, or connect a headset, and reload this page.',
      inUse:
        'Another app is holding your microphone. Close any other call, recorder, or meeting window, then reload this page.',
      insecure:
        'Browsers only share a microphone over a secure connection. Open this site on localhost or https and try again.',
      unknown: 'We could not reach your microphone. Check its connection and reload this page.',
    },

    // The camera is optional: it powers the self-view and the closing presence
    // notes, and the interview runs perfectly well without either.
    cameraOffTitle: 'Running without your camera',
    cameraFaults: {
      systemBlocked:
        'Windows is blocking camera access for your browser. To turn it on, open Settings → Privacy → Camera and enable camera access for your apps.',
      siteBlocked:
        'This site is not allowed to use your camera. To turn it on, click the padlock in the address bar and set Camera to Allow.',
      notFound: 'No camera was found on this device.',
      inUse: 'Another app is using your camera.',
      insecure: 'Your camera needs a secure connection, so it is unavailable here.',
      unknown: 'Your camera could not be started.',
    },
    cameraOffBody:
      'The interview itself is unaffected — you will be heard, transcribed, and scored exactly as normal. You will just have no self-view, and no notes on how you came across on camera.',
    cameraUnavailableAction: 'Camera unavailable',
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
