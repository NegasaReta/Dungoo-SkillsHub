/**
 * Turns raw interview session history into the numbers the Skill Passport (FR-6)
 * and progress dashboard (FR-7) render. Both pages read from one summary so a
 * score can never disagree between them.
 *
 * Input is the session shape returned by the interview API: each session holds
 * `responses`, each response carrying clarity_score, confidence_score and
 * star_score on the 1-5 rubric.
 */
import { ROLES, SCORE_MAX } from '../constants.js'
import { humanize } from './labels.js'

export const AXES = [
  { key: 'clarity_score', label: 'Clarity' },
  { key: 'confidence_score', label: 'Confidence' },
  { key: 'star_score', label: 'STAR' },
]

/** Practice targets the dashboard measures against. */
export const WEEKLY_SESSION_GOAL = 5
export const DAILY_ANSWER_GOAL = 6

const roleLabel = (slug) => ROLES.find((role) => role.slug === slug)?.label ?? slug

const mean = (values) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0

/** Local calendar day, so streaks follow the user's clock rather than UTC. */
function dayKey(value) {
  const date = new Date(value)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function shiftDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/** Consecutive days ending today (or yesterday, if today has no practice yet). */
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

function formatWhen(value, now) {
  const date = new Date(value)
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (dayKey(date) === dayKey(now)) return `Today, ${time}`
  if (dayKey(date) === dayKey(shiftDays(now, -1))) return `Yesterday, ${time}`
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`
}

const monthYear = (value) =>
  new Date(value).toLocaleDateString([], { month: 'short', year: 'numeric' })

export const EMPTY_SUMMARY = {
  hasHistory: false,
  sessionCount: 0,
  sessionsThisWeek: 0,
  answerCount: 0,
  answersToday: 0,
  averages: { clarity: 0, confidence: 0, star: 0 },
  overall: 0,
  strongest: null,
  weakest: null,
  changePercent: 0,
  streakDays: 0,
  weekProgress: [false, false, false, false, false],
  growth: [],
  activities: [],
  rolesPracticed: [],
  lastSessionAt: null,
}

export function summarizeSessions(sessions = [], now = new Date()) {
  const scored = sessions.filter((session) => session.responses?.length)
  if (!scored.length) return EMPTY_SUMMARY

  const responses = scored.flatMap((session) => session.responses)
  const averages = {
    clarity: mean(responses.map((response) => response.clarity_score)),
    confidence: mean(responses.map((response) => response.confidence_score)),
    star: mean(responses.map((response) => response.star_score)),
  }

  const ranked = AXES.map(({ key, label }) => ({
    label,
    value: mean(responses.map((response) => response[key])),
  })).sort((a, b) => b.value - a.value)

  // Session averages in chronological order — the series behind the growth chart
  // and the score change indicator.
  const sessionAverages = scored.map((session) => ({
    session,
    value: mean(
      session.responses.flatMap((response) => AXES.map(({ key }) => response[key]))
    ),
  }))

  const last = sessionAverages.at(-1)
  const previous = sessionAverages.at(-2)
  const changePercent =
    previous && previous.value
      ? Math.round(((last.value - previous.value) / previous.value) * 1000) / 10
      : 0

  const activeDays = new Set(
    responses.map((response) => dayKey(response.created_at ?? now))
  )
  const lastSevenDays = new Set(
    [0, 1, 2, 3, 4, 5, 6].map((offset) => dayKey(shiftDays(now, -offset)))
  )

  return {
    hasHistory: true,
    sessionCount: scored.length,
    sessionsThisWeek: scored.filter((session) => lastSevenDays.has(dayKey(session.created_at)))
      .length,
    answerCount: responses.length,
    answersToday: responses.filter(
      (response) => dayKey(response.created_at ?? now) === dayKey(now)
    ).length,
    averages,
    overall: mean(Object.values(averages)),
    strongest: ranked[0],
    weakest: ranked.at(-1),
    changePercent,
    streakDays: countStreak(activeDays, now),
    weekProgress: [4, 3, 2, 1, 0].map((offset) =>
      activeDays.has(dayKey(shiftDays(now, -offset)))
    ),
    growth: sessionAverages.map((entry, index) => ({
      day: `S${index + 1}`,
      value: Math.round((entry.value / SCORE_MAX) * 100),
    })),
    activities: [...sessionAverages]
      .reverse()
      .slice(0, 5)
      .map(({ session, value }) => ({
        id: session.id,
        name: `${roleLabel(session.role)} mock interview`,
        category: 'AI Video Interview',
        duration: `${session.responses.length} answer${session.responses.length === 1 ? '' : 's'}`,
        score: Math.round(value * 10) / 10,
        date: formatWhen(session.created_at, now),
        status: session.status === 'completed' ? 'completed' : 'in_progress',
      })),
    rolesPracticed: [...new Set(scored.map((session) => session.role))],
    lastSessionAt: last.session.created_at,
  }
}

/**
 * Radar axes for the passport. Only the three scored axes are real; Readiness is
 * derived from them rather than invented, so nothing on the credential is fake.
 */
export function passportScores(summary) {
  const { clarity, confidence, star } = summary.averages
  const round = (value) => Math.round(value * 10) / 10

  return {
    Clarity: round(clarity),
    Confidence: round(confidence),
    STAR: round(star),
    Readiness: round(mean([clarity, confidence, star])),
    Consistency: summary.hasHistory
      ? round(Math.min(SCORE_MAX, 1 + summary.sessionCount * 0.8))
      : 0,
  }
}

/**
 * One entry per calendar day across the trailing window, oldest first. Days with
 * no practice are kept with `average: null` so a gap reads as a gap in a chart
 * instead of being smoothed into a flat line.
 */
export function dailyActivity(sessions = [], days = 30, now = new Date()) {
  const buckets = new Map()

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = shiftDays(now, -offset)
    buckets.set(dayKey(date), { date, answers: 0, scoreTotal: 0 })
  }

  for (const response of sessions.flatMap((session) => session.responses ?? [])) {
    const bucket = buckets.get(dayKey(response.created_at ?? now))
    if (!bucket) continue

    bucket.answers += 1
    bucket.scoreTotal += mean(AXES.map(({ key }) => response[key]))
  }

  return [...buckets.values()].map(({ date, answers, scoreTotal }) => ({
    date,
    answers,
    average: answers ? Math.round((scoreTotal / answers) * 10) / 10 : null,
  }))
}

/** Chunks daily activity into columns of seven days for the practice heatmap. */
export function activityWeeks(activity) {
  const weeks = []
  for (let index = 0; index < activity.length; index += 7) {
    weeks.push(activity.slice(index, index + 7))
  }
  return weeks
}

/** Heatmap shading step, 0 (no practice) to 4 (a heavy day). */
export const activityLevel = (answers) => Math.min(4, answers)

export function averageScore(scores = {}) {
  return mean(Object.values(scores))
}

export function topSkill(scores = {}) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
}

const TIERS = [
  { min: 4.3, label: 'Job Ready' },
  { min: 3.5, label: 'Rising Talent' },
  { min: 2.5, label: 'Building Skills' },
  { min: 0, label: 'Getting Started' },
]

export const tierFor = (overall) => TIERS.find((tier) => overall >= tier.min).label

/** Stable, shareable-looking id derived from the account id. */
export function passportId(user) {
  const source = String(user?.id ?? '')
  let hash = 0
  for (const char of source) hash = (hash * 31 + char.charCodeAt(0)) % 0xffffff
  return `DH-${String(hash).padStart(6, '0').slice(0, 4)}-${hash.toString(36).toUpperCase().padStart(4, '0').slice(0, 4)}`
}

const list = (values = []) => values.map(humanize).filter(Boolean).join(' · ')

/**
 * The credential header. Everything shown comes from the account profile or from
 * scored sessions — nothing on a shareable credential should be invented.
 */
export function buildPassport(user, summary) {
  const practiced = summary.rolesPracticed.map(roleLabel)
  const industries = user?.industries ?? []

  return {
    passportId: passportId(user),
    role: practiced[0] ?? (industries.length ? `${humanize(industries[0])} track` : 'Career starter'),
    target: list(industries) || 'Not set yet',
    languages: list(user?.languages) || 'Not set yet',
    tier: tierFor(summary.overall),
    verified: summary.hasHistory,
    summary: summary.hasHistory
      ? `${summary.answerCount} interview answer${summary.answerCount === 1 ? '' : 's'} scored across ${summary.sessionCount} session${summary.sessionCount === 1 ? '' : 's'}, averaging ${summary.overall.toFixed(1)} of ${SCORE_MAX}. Strongest axis: ${summary.strongest.label}.`
      : 'Complete a mock interview to start building this credential. Scores for clarity, confidence, and STAR structure appear here automatically.',
  }
}

const GOLD_SESSIONS = 5
const ELITE_SESSIONS = 10

export function deriveCredentials(summary) {
  const { sessionCount, averages } = summary

  const path =
    sessionCount >= ELITE_SESSIONS
      ? { status: 'elite', statusLabel: 'Elite level' }
      : sessionCount >= GOLD_SESSIONS
        ? { status: 'gold', statusLabel: 'Gold tier' }
        : { status: 'progress', statusLabel: 'In progress' }

  const axisCredential = (title, icon, value, target) =>
    value >= target
      ? {
          title,
          icon,
          subtitle: `Average ${value.toFixed(1)} of ${SCORE_MAX} across scored answers`,
          status: 'elite',
          statusLabel: 'Elite level',
        }
      : {
          title,
          icon,
          subtitle: value
            ? `At ${value.toFixed(1)} — reach ${target.toFixed(1)} to unlock`
            : `Score an interview answer to start this badge`,
          status: 'progress',
          statusLabel: 'In progress',
        }

  return [
    {
      id: 'interview-path',
      title: 'Mock Interview Path',
      icon: 'award',
      subtitle:
        sessionCount >= GOLD_SESSIONS
          ? `Completed ${sessionCount} scored sessions`
          : `${GOLD_SESSIONS - sessionCount} more session${GOLD_SESSIONS - sessionCount === 1 ? '' : 's'} to Gold tier`,
      ...path,
    },
    { id: 'business-english', ...axisCredential('Business English', 'language', averages.clarity, 4) },
    { id: 'star-structure', ...axisCredential('STAR Structure', 'brain', averages.star, 4) },
  ]
}

export function deriveMilestones(summary, sessions = [], user = null) {
  const milestones = []
  const scored = sessions.filter((session) => session.responses?.length)

  if (summary.overall >= 4) {
    milestones.push({
      id: 'tier',
      date: monthYear(summary.lastSessionAt),
      title: `${tierFor(summary.overall)} tier reached`,
      detail: `Overall score of ${summary.overall.toFixed(1)} of ${SCORE_MAX} across ${summary.answerCount} scored answers.`,
      kind: 'achievement',
    })
  }

  if (summary.streakDays >= 2) {
    milestones.push({
      id: 'streak',
      date: monthYear(summary.lastSessionAt),
      title: `${summary.streakDays}-day practice streak`,
      detail: 'Consistency is what employers read as preparation.',
      kind: 'achievement',
    })
  }

  const completed = scored.filter((session) => session.status === 'completed')
  if (completed.length) {
    const first = completed[0]
    milestones.push({
      id: 'first-session',
      date: monthYear(first.created_at),
      title: `First ${roleLabel(first.role)} session completed`,
      detail: `${completed.length} full session${completed.length === 1 ? '' : 's'} finished end to end.`,
      kind: 'course',
    })
  }

  if (user?.created_at) {
    milestones.push({
      id: 'account',
      date: monthYear(user.created_at),
      title: 'Account initialized',
      detail: 'Joined Dungoo SkillsHub and started the Skill Passport.',
      kind: 'system',
    })
  }

  return milestones
}
