/**
 * The resource library catalogue.
 *
 * Content lives here as data rather than inside components so a translated
 * catalogue can be swapped in later. Two deliberate constraints:
 *
 *  1. Every item is readable inside the app. There are no links to PDFs, videos, or
 *     downloads that do not exist — a button that goes nowhere is worse than no
 *     button, especially in a demo.
 *  2. Nothing here quotes a statistic. Advice is practical and checkable; invented
 *     market figures would be indistinguishable from real research to a reader.
 *
 * `format` drives the card treatment. `action` points a drill at a feature that is
 * actually built; `body` is what the in-app reader renders.
 */
export const TOPICS = [
  { slug: 'all', label: 'All topics' },
  { slug: 'professional-english', label: 'Professional English' },
  { slug: 'interview-kits', label: 'Interview kits' },
  { slug: 'soft-skills', label: 'Soft skills' },
  { slug: 'job-market', label: 'Employer research' },
]

export const FORMATS = {
  guide: { label: 'Guide', icon: 'resources' },
  checklist: { label: 'Checklist', icon: 'list' },
  drill: { label: 'Practice drill', icon: 'mic' },
  template: { label: 'Template', icon: 'passport' },
  video: { label: 'Video', icon: 'play' },
}

/**
 * Videos are a fixed bank, exactly like the interview question bank: no live search,
 * no LLM guessing at links. Every id below was checked against YouTube's oEmbed
 * endpoint, and the title and channel are the ones YouTube returned — five of the
 * twelve ids originally considered were dead, which is why this is not generated.
 *
 * Nothing is embedded until the user opens the resource, so the page stays light on
 * a slow connection, and the player is loaded from youtube-nocookie.com.
 *
 * To add one: confirm it resolves at
 * https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=ID
 * then copy the returned title and author_name here. Duration is left out on purpose
 * — oEmbed does not return it, and a guessed runtime is still a wrong number.
 */
const VIDEOS = [
  {
    id: 'video-tell-me-about-yourself',
    title: 'Tell me about yourself — a good answer to this interview question',
    channel: 'Linda Raynier',
    videoId: 'kayOhGRcNt4',
    topic: 'interview-kits',
    format: 'video',
    level: 'Beginner',
    axis: 'clarity',
    summary:
      'A worked answer to the opening question, delivered out loud. Pair it with our written guide and copy the structure, not the words.',
    body: [
      {
        heading: 'What to take from it',
        bullets: [
          'Notice how short the answer is. Under two minutes, and nothing in it is unrelated to the job.',
          'She ends by connecting herself to the role — that last line is what most candidates leave out.',
          'Watch once for structure, then write your own version before watching again.',
        ],
      },
    ],
  },
  {
    id: 'video-story-structure',
    title: 'Nancy Duarte uncovers the common structure of the greatest communicators',
    channel: 'TEDx Talks',
    videoId: '1nYFpuc2Umk',
    topic: 'interview-kits',
    format: 'video',
    level: 'Intermediate',
    axis: 'star',
    summary:
      'Why persuasive stories move between what is and what could be. The same shape is what makes a STAR answer land instead of listing facts.',
    body: [
      {
        heading: 'What to take from it',
        bullets: [
          'The tension between "what is" and "what could be" is the same tension between your Situation and your Result.',
          'Your actions are the bridge. If the interviewer cannot feel the gap you were closing, the actions sound routine.',
          'Try re-telling one of your prepared answers with the problem stated more sharply at the start.',
        ],
      },
    ],
  },
  {
    id: 'video-speak-to-be-heard',
    title: 'How to speak so that people want to listen',
    channel: 'TED',
    videoId: 'eIho2S0ZahI',
    topic: 'professional-english',
    format: 'video',
    level: 'Beginner',
    axis: 'clarity',
    summary:
      'Practical work on pace, pitch, and register — the parts of spoken English that decide whether you are followed, separate from your vocabulary.',
    body: [
      {
        heading: 'What to take from it',
        bullets: [
          'Speaking more slowly is the cheapest clarity gain available to you, especially in a second language.',
          'The vocal warm-ups at the end are worth doing before an interview, not just before a speech.',
          'Register matters: the same sentence lands differently spoken from the chest than from the throat.',
        ],
      },
    ],
  },
  {
    id: 'video-sound-smart',
    title: 'How to sound smart in your TEDx talk',
    channel: 'TEDx Talks',
    videoId: '8S0FDjFBj8o',
    topic: 'professional-english',
    format: 'video',
    level: 'Beginner',
    axis: 'clarity',
    summary:
      'A talk that says nothing at all, on purpose, using every trick that makes a speaker sound impressive. The fastest way to learn to hear filler in your own answers.',
    body: [
      {
        heading: 'What to take from it',
        bullets: [
          'Every device he uses is one an interviewer has heard a hundred times and stopped being impressed by.',
          'Listen for the confident delivery attached to empty content — then check your own answers for the same gap.',
          'Contrast it with a STAR answer, where each sentence carries a fact someone could ask a follow-up about.',
        ],
      },
    ],
  },
  {
    id: 'video-body-language',
    title: 'Your body language may shape who you are',
    channel: 'TED',
    videoId: 'Ks-_Mh1QhMc',
    topic: 'soft-skills',
    format: 'video',
    level: 'Beginner',
    axis: 'confidence',
    summary:
      'On how posture affects how you feel, not only how you are read. Useful in the minutes before an interview starts.',
    body: [
      {
        heading: 'What to take from it',
        bullets: [
          'The practical claim to use is the modest one: how you hold yourself changes how you feel going in.',
          'On a video interview, only your shoulders and face are visible — sit so they are open rather than hunched.',
          'Her own story about impostor feelings is worth more than the posture advice for most first interviews.',
        ],
      },
    ],
  },
  {
    id: 'video-better-conversation',
    title: '10 ways to have a better conversation',
    channel: 'TED',
    videoId: 'R1vskiVDwl4',
    topic: 'soft-skills',
    format: 'video',
    level: 'Beginner',
    summary:
      'Rules for real two-way conversation. Directly useful in a peer exchange session, where the listening half is what your partner came for.',
    body: [
      {
        heading: 'What to take from it',
        bullets: [
          'Asking open questions and then actually waiting is most of the skill.',
          '"Everyone you meet knows something you do not" is the right posture for an exchange session.',
          'In your next partner session, try going a full turn without steering the topic back to yourself.',
        ],
      },
    ],
  },
  {
    id: 'video-listen-better',
    title: '5 ways to listen better',
    channel: 'TED',
    videoId: 'cSohjlYQI2A',
    topic: 'soft-skills',
    format: 'video',
    level: 'Beginner',
    summary:
      'Listening as a trainable skill. The half of a language exchange most people neglect, and what makes a partner want a second session.',
    body: [
      {
        heading: 'What to take from it',
        bullets: [
          'Silence, mixing, and savouring are small habits you can practise inside a 40-minute exchange.',
          'Listening carefully in your second language is harder and more valuable than speaking in it.',
          'Ask your partner to tell you where you stopped listening. It is the most useful feedback available.',
        ],
      },
    ],
  },
]

/** Axis a resource helps with, used to order the library against real scores. */
export const AXIS_TAGS = {
  Clarity: 'clarity',
  Confidence: 'confidence',
  STAR: 'star',
}

const GUIDES = [
  {
    id: 'star-method',
    title: 'The STAR method, end to end',
    summary:
      'The structure interviewers listen for, a worked example, and the four sentences you can fall back on under pressure.',
    topic: 'interview-kits',
    format: 'guide',
    minutes: 10,
    level: 'Beginner',
    axis: 'star',
    featured: true,
    body: [
      {
        heading: 'What the four letters are for',
        paragraphs: [
          'STAR is not a script. It is the order an interviewer needs information in so they can follow a story they were not part of: where you were, what you were responsible for, what you personally did, and how it ended.',
          'Most weak answers are not missing detail. They are missing order — the actions arrive before anyone knows why they mattered.',
        ],
        bullets: [
          'Situation — where you were and what was happening, in one or two sentences.',
          'Task — what you were responsible for. Not what the team faced, what you owed.',
          'Action — the steps you took, in sequence, in the first person.',
          'Result — how it ended, with a number if you have an honest one.',
        ],
      },
      {
        heading: 'A worked example',
        paragraphs: [
          'Question: tell me about a time you found a problem others had missed.',
        ],
        example:
          'Last year we were getting reports that a few users lost items from their cart. My task was to find the cause before the holiday sale. First I added logging around the session handler, then I reproduced it on a slow connection. Two requests were writing the same key. I changed it to a single write, and the reports stopped that week.',
        paragraphsAfter: [
          'Four sentences, four parts, no filler. Notice that the result is specific without inflating anything: the reports stopped, and that is all it claims.',
        ],
      },
      {
        heading: 'The three mistakes that cost the most',
        bullets: [
          'Living in the situation. Two sentences of context is plenty; the interviewer is buying your actions.',
          'Saying "we" through the whole answer. If the interviewer cannot tell what you did, they cannot credit you for it.',
          'Stopping before the result. An answer with no ending reads as an attempt, not an outcome.',
        ],
      },
      {
        heading: 'Your fallback template',
        paragraphs: [
          'When your mind goes blank, fill these four lines out loud and stop. It will never be your best answer, but it is never a bad one.',
        ],
        bullets: [
          '"At [place], we were dealing with [problem]."',
          '"I was responsible for [your specific job]."',
          '"First I [action], then I [action]."',
          '"In the end, [outcome]."',
        ],
      },
    ],
  },
  {
    id: 'tell-me-about-yourself',
    title: 'Answering "tell me about yourself"',
    summary:
      'The opening question decides how the rest of the interview is heard. A three-part answer you can adapt to any role in under a minute.',
    topic: 'interview-kits',
    format: 'guide',
    minutes: 6,
    level: 'Beginner',
    axis: 'clarity',
    body: [
      {
        heading: 'What is actually being asked',
        paragraphs: [
          'It is not an invitation to narrate your life. It is a request for a summary of why you are a reasonable person to be sitting there. Aim for sixty to ninety seconds.',
        ],
      },
      {
        heading: 'Present, past, why here',
        bullets: [
          'Present — what you do now, in one line. "I am a final-year computer science student who has been building internal tools for my department."',
          'Past — the one or two things that got you here and are relevant to this role. Skip anything that is not.',
          'Why here — what specifically drew you to this job, in a sentence that could not be pasted into another application.',
        ],
      },
      {
        heading: 'What to cut',
        bullets: [
          'Where you were born and every school you attended, unless asked.',
          'Adjectives about yourself. "I am hardworking and a fast learner" costs you time and proves nothing.',
          'Anything you cannot back up if they ask a follow-up question about it.',
        ],
      },
    ],
  },
  {
    id: 'professional-english-tech',
    title: 'Professional English for technical interviews',
    summary:
      'Phrase banks for explaining a system, disagreeing without friction, and buying yourself time when you need to think.',
    topic: 'professional-english',
    format: 'guide',
    minutes: 8,
    level: 'Intermediate',
    axis: 'clarity',
    body: [
      {
        heading: 'Explaining how something works',
        paragraphs: [
          'Interviewers judge whether they could work with you, not whether your grammar is perfect. Signposting matters more than vocabulary.',
        ],
        bullets: [
          '"At a high level, it works like this…" then give the shape before the detail.',
          '"There are three parts to it. First… second… finally…"',
          '"The tricky part was X, because Y."',
          '"To give you a concrete example…"',
        ],
      },
      {
        heading: 'Disagreeing without friction',
        bullets: [
          '"I see the argument for that. My concern is…"',
          '"That works if X holds. In our case…"',
          '"Can I offer a different read on it?"',
          '"I agree on the goal. I would get there differently, because…"',
        ],
      },
      {
        heading: 'Buying time, honestly',
        paragraphs: [
          'Silence is allowed. Filling it with "um" is what costs you. Say what you are doing instead.',
        ],
        bullets: [
          '"Let me think about that for a second."',
          '"To make sure I understood — you are asking about X?"',
          '"I have not hit that exact case. The closest I have is…"',
        ],
      },
    ],
  },
  {
    id: 'workplace-writing',
    title: 'Email and chat phrases that read as professional',
    summary:
      'Openings, follow-ups, and the two sentences that make a request easy to say yes to.',
    topic: 'professional-english',
    format: 'guide',
    minutes: 5,
    level: 'Beginner',
    axis: 'clarity',
    body: [
      {
        heading: 'Make the ask findable',
        paragraphs: [
          'Put the request in the first two lines. A reader who has to hunt for what you want is a reader who replies tomorrow.',
        ],
        bullets: [
          '"I am writing to ask about X. If it is easier, I am happy to call."',
          '"Two quick questions on X, then I will get out of your way."',
        ],
      },
      {
        heading: 'Following up without nagging',
        bullets: [
          '"Following up on my note from Tuesday, in case it got buried."',
          '"No rush on this — flagging it so it does not fall off."',
          '"Is there anything you need from me to move this forward?"',
        ],
      },
      {
        heading: 'After an interview',
        paragraphs: [
          'Send it the same day, keep it to four sentences, and mention one specific thing from the conversation so it is obviously not a template.',
        ],
      },
    ],
  },
  {
    id: 'interview-day-checklist',
    title: 'Interview day checklist',
    summary:
      'What to settle the night before, the hour before, and the minute before, so none of it costs you attention during the interview.',
    topic: 'interview-kits',
    format: 'checklist',
    minutes: 4,
    level: 'Beginner',
    axis: 'confidence',
    body: [
      {
        heading: 'The night before',
        bullets: [
          'Re-read the job post and write down the three things they clearly care about most.',
          'Have two stories ready per item on that list. Two, not one — the first may not fit the question.',
          'Write your three questions for them. "I have no questions" reads as no interest.',
          'Check the address or the meeting link, and who you are meeting.',
        ],
      },
      {
        heading: 'For a remote interview',
        bullets: [
          'Test the camera and microphone in the actual app you will use, not a different one.',
          'Sit with a light source in front of you rather than behind you.',
          'Have a phone number as a backup, and say at the start that you will call if the connection drops.',
          'Close every tab that can make a sound.',
        ],
      },
      {
        heading: 'The last minute',
        bullets: [
          'Water within reach. A dry mouth reads as nerves.',
          'One page of notes, keywords only — full sentences pull you into reading.',
          'Decide your opening line for "tell me about yourself" and say it out loud once.',
        ],
      },
    ],
  },
  {
    id: 'cv-structure',
    title: 'A CV that survives a thirty-second scan',
    summary:
      'The order, the phrasing, and the sections to cut. Built to be read quickly by someone who has forty others to get through.',
    topic: 'interview-kits',
    format: 'template',
    minutes: 7,
    level: 'Beginner',
    axis: 'clarity',
    body: [
      {
        heading: 'Order it by what they are buying',
        bullets: [
          'Name and one line saying what you are. Then how to reach you, on one line.',
          'Experience or projects, most recent first. Students: real projects count as experience.',
          'Education, short — degree, institution, year.',
          'Skills, grouped, no self-rated bars or percentages.',
        ],
      },
      {
        heading: 'Write bullets as outcomes',
        paragraphs: [
          'A duty tells them what your job was. An outcome tells them what changed because you were there.',
        ],
        bullets: [
          'Instead of "responsible for the reporting process", write "cut the weekly report from two days of manual work to about twenty minutes".',
          'Start with a verb, keep it to one line, and only use a number you could defend if asked.',
        ],
      },
      {
        heading: 'Cut these',
        bullets: [
          'A photo, marital status, date of birth, and religion — none of it helps and some of it invites bias.',
          '"References available on request." Assumed.',
          'Any skill you would not want to be asked a question about.',
        ],
      },
    ],
  },
  {
    id: 'employer-research',
    title: 'Researching an employer before you interview',
    summary:
      'Where to look, what to write down, and how to use it in an answer without sounding like you rehearsed a fact sheet.',
    topic: 'job-market',
    format: 'guide',
    minutes: 7,
    level: 'Intermediate',
    axis: 'confidence',
    body: [
      {
        heading: 'Where to look',
        bullets: [
          'Their own site — what they sell, to whom, and how they describe it. Use their words back to them.',
          'Recent news or announcements. A new product, office, or partnership is the easiest question you will ever ask.',
          'The job post itself, read twice. The order of requirements usually reflects priority.',
          'People, if you can reach them. One honest conversation beats an hour of reading.',
        ],
      },
      {
        heading: 'What to write down',
        paragraphs: [
          'Three things only, or you will try to use all of it and sound rehearsed.',
        ],
        bullets: [
          'What the company is trying to do this year, as best you can tell.',
          'Where the role sits in that.',
          'One genuine question you could not answer from the website.',
        ],
      },
      {
        heading: 'Using it naturally',
        paragraphs: [
          'Do not open with your research. Attach it to an answer where it belongs: "You mentioned the new mobile product — that is close to what I did on X, where…". One well-placed reference lands harder than five.',
        ],
      },
    ],
  },
  {
    id: 'filler-words-drill',
    title: 'Cut your filler words',
    summary:
      'Filler is the fastest thing to fix in your clarity score. Record one answer, then read the transcript back and count them.',
    topic: 'soft-skills',
    format: 'drill',
    minutes: 15,
    level: 'Beginner',
    axis: 'clarity',
    action: { label: 'Open mock interview', to: '/interview' },
    body: [
      {
        heading: 'How to run it',
        bullets: [
          'Answer one question in the mock interview and submit it for scoring.',
          'Read your own transcript and mark every "um", "like", "basically", "you know", and "sort of".',
          'Answer the same question again, and pause silently where the filler was.',
          'Compare the two clarity scores.',
        ],
      },
      {
        heading: 'Why silence works',
        paragraphs: [
          'Filler is a habit for covering thinking time. A pause does the same job and reads as composure instead of nerves. It feels much longer to you than it does to the listener.',
        ],
      },
    ],
  },
  {
    id: 'speak-out-loud-drill',
    title: 'Practise out loud with a partner',
    summary:
      'Reading answers silently builds false confidence. Forty minutes of speaking with a language partner exposes what you cannot yet say fluently.',
    topic: 'soft-skills',
    format: 'drill',
    minutes: 40,
    level: 'Intermediate',
    axis: 'confidence',
    action: { label: 'Find a partner', to: '/matching' },
    body: [
      {
        heading: 'How to run it',
        bullets: [
          'Bring three questions you already have answers for. The point is delivery, not invention.',
          'Take turns: one answers, one listens and notes where they lost the thread.',
          'Swap languages halfway so both of you get the practice you came for.',
          'End by re-answering the weakest one.',
        ],
      },
      {
        heading: 'What to ask your partner for',
        bullets: [
          '"Where did you stop following me?" — more useful than "was that good?".',
          '"Did you hear what I personally did?"',
          '"What would you have asked next?"',
        ],
      },
    ],
  },
]

export const RESOURCES = [...GUIDES, ...VIDEOS]

export const featuredResource = () => RESOURCES.find((resource) => resource.featured)

/**
 * Orders the library against a scored axis, so the weakest one is what the user is
 * pointed at first. With no scores yet the original order stands.
 */
export function recommendResources(resources, axisLabel, limit = 3) {
  const axis = AXIS_TAGS[axisLabel]
  if (!axis) return resources.slice(0, limit)

  return [
    ...resources.filter((resource) => resource.axis === axis),
    ...resources.filter((resource) => resource.axis !== axis),
  ].slice(0, limit)
}

export function filterResources(resources, { topic = 'all', query = '' } = {}) {
  const needle = query.trim().toLowerCase()

  return resources.filter((resource) => {
    if (topic !== 'all' && resource.topic !== topic) return false
    if (!needle) return true

    return [
      resource.title,
      resource.summary,
      resource.channel ?? '',
      FORMATS[resource.format].label,
      resource.level,
    ]
      .join(' ')
      .toLowerCase()
      .includes(needle)
  })
}
