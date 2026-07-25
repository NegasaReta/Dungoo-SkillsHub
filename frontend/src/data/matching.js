/**
 * Placeholder peers for the language-exchange mockup (FR-2, mockup/roadmap scope).
 * Live matching against real accounts is not part of the hackathon build, but the
 * pairing rule shown here is the real one: a match needs a peer who speaks what
 * you want to practise AND wants to practise what you speak.
 *
 * Language ids match the profile options in lib/options.js.
 */
export const EXCHANGE_LANGUAGES = ['amharic', 'afaan_oromo', 'tigrinya', 'english']

export const MATCHING_INDUSTRIES = [
  { id: 'any', label: 'Any industry' },
  { id: 'tech', label: 'Tech & Software' },
  { id: 'health', label: 'Health' },
  { id: 'finance', label: 'Finance' },
  { id: 'education', label: 'Education' },
  { id: 'engineering', label: 'Engineering' },
]

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export const PEERS = [
  {
    id: 1,
    name: 'Sara Tesfaye',
    title: 'Product Designer @ EthioPay',
    initials: 'ST',
    industry: 'tech',
    level: 'Intermediate',
    online: true,
    speaks: ['amharic', 'english'],
    learning: ['afaan_oromo'],
    lookingFor: 'Wants to practise product interviews in English and pick up Afaan Oromo.',
  },
  {
    id: 2,
    name: 'Abebe Kebede',
    title: 'Backend Engineer @ AddisTech',
    initials: 'AK',
    industry: 'tech',
    level: 'Advanced',
    online: true,
    speaks: ['afaan_oromo', 'amharic'],
    learning: ['english'],
    lookingFor: 'Looking for English STAR practice ahead of remote interviews.',
  },
  {
    id: 3,
    name: 'Hanna Girma',
    title: 'Data Analyst @ BlueNile',
    initials: 'HG',
    industry: 'finance',
    level: 'Intermediate',
    online: true,
    speaks: ['english', 'tigrinya'],
    learning: ['amharic'],
    lookingFor: 'Happy to run English sessions in exchange for Amharic conversation.',
  },
  {
    id: 4,
    name: 'Yonas Hailu',
    title: 'Nurse @ Black Lion Hospital',
    initials: 'YH',
    industry: 'health',
    level: 'Beginner',
    online: false,
    speaks: ['amharic'],
    learning: ['english', 'tigrinya'],
    lookingFor: 'Starting out in English and needs patient, slow-paced partners.',
  },
  {
    id: 5,
    name: 'Meron Alemu',
    title: 'Teacher @ Adama Prep',
    initials: 'MA',
    industry: 'education',
    level: 'Advanced',
    online: true,
    speaks: ['afaan_oromo', 'english'],
    learning: ['tigrinya'],
    lookingFor: 'Trades English fluency practice for Tigrinya beginner sessions.',
  },
  {
    id: 6,
    name: 'Dawit Bekele',
    title: 'Site Engineer @ Rift Valley Build',
    initials: 'DB',
    industry: 'engineering',
    level: 'Intermediate',
    online: false,
    speaks: ['tigrinya', 'amharic'],
    learning: ['english', 'afaan_oromo'],
    lookingFor: 'Preparing for site-lead interviews conducted in English.',
  },
]
