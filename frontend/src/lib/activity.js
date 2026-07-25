/**
 * One timeline across every kind of practice, so progress is not just interviews.
 *
 * Interview answers are counted (they carry scores but no duration — the recorder
 * does not persist how long an answer took). Peer exchange sessions are timed, so
 * they are the source of real practice minutes. Keeping the two units separate is
 * deliberate: a minutes figure that silently guessed interview length would be a
 * made-up number on a page that claims to be measured.
 */
import { AXES } from './progress.js'

export const ACTIVITY_KINDS = {
  interview: { key: 'interview', label: 'Mock interview', icon: 'mic', timed: false },
  exchange: { key: 'exchange', label: 'Language exchange', icon: 'matching', timed: true },
}

const mean = (values) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0

const round1 = (value) => Math.round(value * 10) / 10

function dayKey(value) {
  const date = new Date(value)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function shiftDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Flattens both sources into comparable events, oldest first. An interview event is
 * one scored answer; an exchange event is one completed session.
 */
export function toEvents({ interviews = [], exchanges = [] } = {}) {
  const events = []

  for (const session of interviews) {
    for (const response of session.responses ?? []) {
      events.push({
        kind: 'interview',
        at: new Date(response.created_at),
        answers: 1,
        minutes: 0,
        score: round1(mean(AXES.map(({ key }) => response[key]))),
        label: 'Interview answer scored',
      })
    }
  }

  for (const session of exchanges) {
    events.push({
      kind: 'exchange',
      at: new Date(session.ended_at ?? session.started_at),
      answers: 0,
      minutes: round1((session.seconds ?? 0) / 60),
      score: null,
      label: `Exchange with ${session.peer_name}`,
    })
  }

  return events.sort((a, b) => a.at - b.at)
}

/** Per-day practice across the trailing window, oldest first. */
export function dailyPractice(events = [], days = 30, now = new Date()) {
  const buckets = new Map()

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = shiftDays(now, -offset)
    buckets.set(dayKey(date), { date, interview: 0, exchange: 0, answers: 0, minutes: 0 })
  }

  for (const event of events) {
    const bucket = buckets.get(dayKey(event.at))
    if (!bucket) continue

    bucket[event.kind] += 1
    bucket.answers += event.answers
    bucket.minutes = round1(bucket.minutes + event.minutes)
  }

  return [...buckets.values()].map((bucket) => ({
    ...bucket,
    events: bucket.interview + bucket.exchange,
  }))
}

const totals = (days) =>
  days.reduce(
    (sum, day) => ({
      events: sum.events + day.events,
      answers: sum.answers + day.answers,
      exchangeSessions: sum.exchangeSessions + day.exchange,
      minutes: round1(sum.minutes + day.minutes),
    }),
    { events: 0, answers: 0, exchangeSessions: 0, minutes: 0 }
  )

/**
 * Practice totals for the selected window next to the window before it, so the page
 * can say "up 3 vs the previous 30 days" instead of showing a number without context.
 */
export function practiceRangeStats(events = [], days = 30, now = new Date()) {
  const window = dailyPractice(events, days * 2, now)

  return {
    ...totals(window.slice(days)),
    previous: totals(window.slice(0, days)),
  }
}

/** Consecutive days of any practice, ending today or yesterday. */
function countStreak(activeDays, now) {
  if (!activeDays.size) return 0

  let cursor = activeDays.has(dayKey(now)) ? now : shiftDays(now, -1)
  if (!activeDays.has(dayKey(cursor))) return 0

  let streak = 0
  while (activeDays.has(dayKey(cursor))) {
    streak += 1
    cursor = shiftDays(cursor, -1)
  }
  return streak
}

export const EMPTY_PRACTICE = {
  hasActivity: false,
  totalEvents: 0,
  answers: 0,
  exchangeSessions: 0,
  minutes: 0,
  streakDays: 0,
  activeDays: 0,
  mix: [],
  lastActiveAt: null,
}

export function practiceSummary(events = [], now = new Date()) {
  if (!events.length) return EMPTY_PRACTICE

  const byKind = (kind) => events.filter((event) => event.kind === kind)
  const interviews = byKind('interview')
  const exchanges = byKind('exchange')
  const minutes = round1(events.reduce((sum, event) => sum + event.minutes, 0))
  const activeDays = new Set(events.map((event) => dayKey(event.at)))

  const mix = [
    {
      ...ACTIVITY_KINDS.interview,
      count: interviews.length,
      detail: `${interviews.length} answer${interviews.length === 1 ? '' : 's'} scored`,
    },
    {
      ...ACTIVITY_KINDS.exchange,
      count: exchanges.length,
      detail: `${round1(exchanges.reduce((sum, event) => sum + event.minutes, 0))} min practised`,
    },
  ].filter((entry) => entry.count > 0)

  return {
    hasActivity: true,
    totalEvents: events.length,
    answers: interviews.length,
    exchangeSessions: exchanges.length,
    minutes,
    streakDays: countStreak(activeDays, now),
    activeDays: activeDays.size,
    mix,
    lastActiveAt: events.at(-1).at.toISOString(),
  }
}
