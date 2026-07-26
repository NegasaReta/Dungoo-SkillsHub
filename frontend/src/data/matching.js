/**
 * Placeholder peers for demo mode and for seeding sample history.
 *
 * The live page gets its partners from the backend, which keeps the same six in
 * app/data/peers.json. This copy exists so the app still works with no server
 * behind it — keep the two in step, or demo mode will show partners the real API
 * has never heard of.
 *
 * Language ids match the profile options in lib/options.js.
 */
export const EXCHANGE_LANGUAGES = ['amharic', 'afaan_oromo', 'tigrinya', 'english']

/** Ordered by ability rather than alphabetically, since the filter reads as a scale. */
export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced']

export const PEERS = [
  {
    id: 1,
    name: 'Sara Tesfaye',
    title: 'Product Designer @ EthioPay',
    initials: 'ST',
    industry: 'tech',
    level: 'intermediate',
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
    level: 'advanced',
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
    level: 'intermediate',
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
    level: 'beginner',
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
    level: 'advanced',
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
    level: 'intermediate',
    online: false,
    speaks: ['tigrinya', 'amharic'],
    learning: ['english', 'afaan_oromo'],
    lookingFor: 'Preparing for site-lead interviews conducted in English.',
  },
]
