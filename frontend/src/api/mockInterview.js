/**
 * Browser-only stand-in for the interview endpoints, mirroring the request and
 * response shapes in api/interview.js so components never know which one is live.
 *
 * The scoring here is a transparent keyword-and-length heuristic, NOT the product's
 * AI scorer. It exists so the interview -> Skill Passport -> dashboard loop can be
 * built and demoed without a backend. Real scoring lives in the FastAPI service and
 * is exercised by backend/tests/test_ai_scoring.py.
 */
import { QUESTION_BANK } from '../data/questions.js'
import { currentUserId } from './mockApi.js'

const SESSIONS_KEY = 'dungoo.mock.sessions'
const LATENCY_MS = 400

const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

function readSessions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

function requireUserId() {
  const id = currentUserId()
  if (!id) throw new Error('Could not validate credentials.')
  return id
}

// --- Heuristic scoring -------------------------------------------------------

const FILLERS = ['um', 'uh', 'er', 'like', 'you know', 'basically', 'sort of', 'kind of']
const HEDGES = ['maybe', 'i think', 'i guess', 'probably', 'i suppose', 'not sure', 'somehow']
const STAR_SIGNALS = {
  situation: ['when i', 'at the time', 'we were', 'the situation', 'last year', 'during', 'my team'],
  task: ['i needed to', 'my job was', 'i was asked', 'my task', 'responsible for', 'the goal', 'i had to'],
  action: ['i decided', 'i built', 'i wrote', 'so i', 'first i', 'then i', 'i reached out', 'i started'],
  result: ['as a result', 'in the end', 'which meant', 'the outcome', 'improved', 'reduced', 'increased', 'saved'],
}

const clamp = (value) => Math.min(5, Math.max(1, Math.round(value * 10) / 10))

/**
 * Counts whole-word occurrences of any phrase. Word boundaries matter: a substring
 * search counts "users" as the filler "er" and tanks an otherwise good answer.
 */
function countPhrases(haystack, phrases) {
  return phrases.reduce((total, phrase) => {
    const pattern = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'g')
    return total + (haystack.match(pattern)?.length ?? 0)
  }, 0)
}

function analyze(transcript) {
  const text = transcript.toLowerCase()
  const words = text.split(/\s+/).filter(Boolean)
  const sentences = transcript.split(/[.!?]+/).filter((part) => part.trim().length > 0)

  const wordCount = words.length
  const perHundred = (count) => (wordCount ? (count / wordCount) * 100 : 0)

  return {
    wordCount,
    sentenceCount: sentences.length,
    avgSentenceWords: sentences.length ? wordCount / sentences.length : wordCount,
    fillersPerHundred: perHundred(countPhrases(text, FILLERS)),
    hedgesPerHundred: perHundred(countPhrases(text, HEDGES)),
    starParts: Object.entries(STAR_SIGNALS)
      .filter(([, phrases]) => countPhrases(text, phrases) > 0)
      .map(([part]) => part),
  }
}

function scoreTranscript(stats) {
  let clarity = 2.5
  if (stats.wordCount >= 60) clarity += 1
  if (stats.wordCount >= 100) clarity += 0.5
  if (stats.wordCount < 30) clarity -= 1
  if (stats.sentenceCount >= 3 && stats.avgSentenceWords <= 24) clarity += 0.75
  if (stats.avgSentenceWords > 35) clarity -= 0.75
  clarity -= stats.fillersPerHundred * 0.25

  let confidence = 3.5
  confidence -= stats.hedgesPerHundred * 0.4
  confidence -= stats.fillersPerHundred * 0.2
  if (stats.wordCount >= 70) confidence += 0.5
  if (stats.wordCount < 30) confidence -= 1

  // One point per STAR component present, so a full answer lands at 5.
  const star = 1 + stats.starParts.length

  return {
    clarity_score: clamp(clarity),
    confidence_score: clamp(confidence),
    star_score: clamp(star),
  }
}

const MISSING_PART_ADVICE = {
  situation: 'Open with the setting — where you were and what was happening.',
  task: 'State what you personally had to achieve, not just what the team faced.',
  action: 'Spell out the steps you took, in order, using "I" rather than "we".',
  result: 'Close with the outcome and a number if you have one.',
}

function buildFeedback(stats, scores) {
  const strengths = []
  const improvements = []

  if (stats.starParts.length >= 3) {
    strengths.push('Your answer follows a story arc an interviewer can follow.')
  }
  if (scores.clarity_score >= 4) {
    strengths.push('Sentences are short enough to stay clear over a phone line.')
  }
  if (scores.confidence_score >= 4) {
    strengths.push('You claim your work directly, without hedging.')
  }
  if (stats.wordCount >= 80 && stats.wordCount <= 200) {
    strengths.push('Length is right for a spoken answer — detailed but not rambling.')
  }
  if (!strengths.length) {
    strengths.push('You gave a real example rather than a generic answer.')
  }

  // Two structure notes at most, so delivery problems still get a mention.
  const structure = ['situation', 'task', 'action', 'result']
    .filter((part) => !stats.starParts.includes(part))
    .map((part) => MISSING_PART_ADVICE[part])

  const delivery = []
  if (stats.wordCount < 40) {
    delivery.push('Expand the answer — aim for 60 to 150 words when you speak it.')
  }
  if (stats.fillersPerHundred > 3) {
    delivery.push('Trim filler words like "um" and "you know"; pause instead.')
  }
  if (stats.hedgesPerHundred > 2) {
    delivery.push('Replace "I think" and "maybe" with what you actually did.')
  }

  improvements.push(...structure.slice(0, 2), ...delivery, ...structure.slice(2))
  if (!improvements.length) {
    improvements.push('Tighten the opening so the situation lands in one sentence.')
  }

  const covered = stats.starParts.length
  const summary =
    `About ${stats.wordCount} words, covering ${covered} of the 4 STAR parts` +
    `${covered === 4 ? '.' : ` (missing ${['situation', 'task', 'action', 'result'].filter((p) => !stats.starParts.includes(p)).join(', ')}).`}`

  return { summary, strengths: strengths.slice(0, 3), improvements: improvements.slice(0, 3) }
}

/**
 * Scores one transcript. Exported so demo history is produced by the same code
 * path as a live answer — seeded scores are computed, never hand-written.
 */
export function buildResponse({ questionId, transcript, createdAt }) {
  const stats = analyze(transcript)
  const scores = scoreTranscript(stats)

  return {
    question_id: questionId,
    transcript,
    ...scores,
    ...buildFeedback(stats, scores),
    created_at: createdAt ?? new Date().toISOString(),
  }
}

// --- Demo history ------------------------------------------------------------
// Sessions carry `demo: true` so seeded history can be cleared without touching
// anything the user actually practised.

export function importSessions(sessions) {
  writeSessions([...readSessions(), ...sessions])
}

export function removeDemoSessions() {
  writeSessions(readSessions().filter((session) => !session.demo))
}

export function hasDemoSessions() {
  return readSessions().some((session) => session.demo)
}

// --- Endpoints ---------------------------------------------------------------

export async function fetchQuestions(role) {
  await delay()

  const bank = QUESTION_BANK[role]
  if (!bank) throw new Error(`No question bank for role '${role}'.`)
  return bank
}

export async function createSession({ role }) {
  await delay()

  const session = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user_id: requireUserId(),
    role,
    status: 'in_progress',
    created_at: new Date().toISOString(),
    completed_at: null,
    responses: [],
  }

  writeSessions([...readSessions(), session])
  return session
}

export async function submitResponse(sessionId, { questionId, transcript }) {
  await delay()

  const userId = requireUserId()
  const sessions = readSessions()
  const index = sessions.findIndex(
    (session) => session.id === sessionId && session.user_id === userId
  )
  if (index === -1) throw new Error('Session not found.')

  const report = buildResponse({ questionId, transcript })

  sessions[index] = { ...sessions[index], responses: [...sessions[index].responses, report] }
  writeSessions(sessions)
  return report
}

export async function completeSession(sessionId) {
  await delay()

  const userId = requireUserId()
  const sessions = readSessions()
  const index = sessions.findIndex(
    (session) => session.id === sessionId && session.user_id === userId
  )
  if (index === -1) throw new Error('Session not found.')

  sessions[index] = {
    ...sessions[index],
    status: 'completed',
    completed_at: new Date().toISOString(),
  }
  writeSessions(sessions)
  return sessions[index]
}

/** Session history for the signed-in user, oldest first. Feeds FR-6 and FR-7. */
export async function fetchSessions() {
  await delay()

  const userId = requireUserId()
  return readSessions()
    .filter((session) => session.user_id === userId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}
