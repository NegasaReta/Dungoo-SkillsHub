import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import ActivityMix from '../components/analytics/ActivityMix.jsx'
import InsightsPanel from '../components/analytics/InsightsPanel.jsx'
import PracticeHeatmap from '../components/analytics/PracticeHeatmap.jsx'
import RoleBreakdown from '../components/analytics/RoleBreakdown.jsx'
import ScoreHistoryChart from '../components/analytics/ScoreHistoryChart.jsx'
import StatCard from '../components/analytics/StatCard.jsx'
import WeeklyActivityChart from '../components/analytics/WeeklyActivityChart.jsx'
import AppShell from '../components/app/AppShell.jsx'
import NavIcon from '../components/app/NavIcon.jsx'
import Loader from '../components/common/Loader.jsx'
import Panel from '../components/dashboard/Panel.jsx'
import GrowthMilestones from '../components/passport/GrowthMilestones.jsx'
import ScoreRadarChart from '../components/passport/ScoreRadarChart.jsx'
import { SCORE_MAX } from '../constants.js'
import { usingMockApi } from '../api/index.js'
import { useUser } from '../context/UserContext.jsx'
import useProgress from '../hooks/useProgress.js'
import { dailyPractice, practiceRangeStats } from '../lib/activity.js'
import { clearDemoData, hasDemoData, seedDemoData } from '../lib/demoData.js'
import {
  dailyActivity,
  deriveInsights,
  deriveMilestones,
  passportScores,
  rangeStats,
  roleBreakdown,
} from '../lib/progress.js'

const RANGES = [7, 30, 90]
const HEATMAP_DAYS = 91

export default function Analytics() {
  const { user } = useUser()
  const { sessions, events, summary, practice, loading } = useProgress()
  const [rangeDays, setRangeDays] = useState(30)

  const scoreHistory = useMemo(() => dailyActivity(sessions, rangeDays), [sessions, rangeDays])
  const thisWeek = useMemo(() => dailyPractice(events, 7), [events])
  const quarter = useMemo(() => dailyPractice(events, HEATMAP_DAYS), [events])
  const scores = useMemo(() => rangeStats(sessions, rangeDays), [sessions, rangeDays])
  const activity = useMemo(() => practiceRangeStats(events, rangeDays), [events, rangeDays])
  const insights = useMemo(
    () =>
      deriveInsights(summary, sessions, {
        practiceDaysInFortnight: dailyPractice(events, 14).filter((day) => day.events > 0).length,
      }),
    [summary, sessions, events]
  )
  const roles = useMemo(() => roleBreakdown(sessions), [sessions])

  const percent = (current, previous) =>
    previous ? Math.round(((current - previous) / previous) * 100) : undefined

  // Minutes read as hours once there is an hour of practice to report.
  const practiceTime =
    activity.minutes >= 60
      ? { value: (activity.minutes / 60).toFixed(1), suffix: 'hrs' }
      : { value: Math.round(activity.minutes), suffix: 'min' }

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-blue">
              Progress
            </p>
            <h1 className="mt-1 text-3xl font-bold text-primary">Performance Analytics</h1>
            <p className="mt-2 max-w-xl text-sm text-primary/60">
              Every mock interview and language exchange you complete, measured — nothing here is
              estimated.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {practice.hasActivity && (
              <>
                <div
                  role="group"
                  aria-label="Date range"
                  className="flex items-center gap-1 rounded-lg border border-primary/15 bg-white p-1"
                >
                  {RANGES.map((days) => (
                    <button
                      key={days}
                      type="button"
                      aria-pressed={rangeDays === days}
                      onClick={() => setRangeDays(days)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
                        rangeDays === days
                          ? 'bg-brand-blue text-white'
                          : 'text-primary/60 hover:text-primary'
                      }`}
                    >
                      {days} days
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-white px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
                >
                  <NavIcon name="download" className="h-4 w-4" />
                  Export PDF
                </button>
              </>
            )}

            <SampleDataButton signedIn={Boolean(user)} />
          </div>
        </div>

        {loading && (
          <Panel>
            <Loader label="Loading your analytics…" />
          </Panel>
        )}

        {!loading && !practice.hasActivity && <AnalyticsEmpty />}

        {!loading && practice.hasActivity && (
          <>
            <div className="grid gap-5 sm:grid-cols-3">
              <StatCard
                icon="clock"
                label="Practice time"
                value={practiceTime.value}
                suffix={practiceTime.suffix}
                changePercent={percent(activity.minutes, activity.previous.minutes)}
                hint={`${activity.exchangeSessions} timed exchange session${activity.exchangeSessions === 1 ? '' : 's'}`}
              />
              <StatCard
                icon="chart"
                label="Practice activities"
                value={activity.events}
                changePercent={percent(activity.events, activity.previous.events)}
                hint={`${activity.answers} interview answer${activity.answers === 1 ? '' : 's'} scored`}
              />
              <StatCard
                icon="award"
                label="Average AI score"
                value={scores.average ? scores.average.toFixed(1) : '—'}
                suffix={`/ ${SCORE_MAX}`}
                changePercent={scores.average ? scores.changePercent : undefined}
                hint={
                  scores.average
                    ? `Across ${scores.sessionCount} session${scores.sessionCount === 1 ? '' : 's'}`
                    : 'Scored from interview answers only'
                }
              />
            </div>

            {summary.hasHistory ? (
              <div className="grid gap-5 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <Panel className="h-full">
                    <h2 className="text-base font-semibold text-primary">Skill Growth</h2>
                    <p className="mt-1 text-xs text-primary/60">
                      Strongest: {summary.strongest.label} · weakest: {summary.weakest.label}
                    </p>
                    <div className="mt-4">
                      <ScoreRadarChart scores={passportScores(summary)} />
                    </div>
                  </Panel>
                </div>
                <div className="lg:col-span-7">
                  <ScoreHistoryChart activity={scoreHistory} />
                </div>
              </div>
            ) : (
              <ScoresPending />
            )}

            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <WeeklyActivityChart practice={thisWeek} />
              </div>
              <div className="lg:col-span-5">
                {summary.hasHistory ? (
                  <GrowthMilestones milestones={deriveMilestones(summary, sessions, user)} />
                ) : (
                  <ActivityMix practice={practice} />
                )}
              </div>
            </div>

            <PracticeHeatmap practice={quarter} streakDays={practice.streakDays} />

            {summary.hasHistory && (
              <div className="grid gap-5 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <ActivityMix practice={practice} />
                </div>
                <div className="lg:col-span-4">
                  <InsightsPanel insights={insights} />
                </div>
                <div className="lg:col-span-4">
                  <RoleBreakdown roles={roles} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}

/**
 * Demo-only affordance: fills the page with sample history so the progress view can
 * be shown without a backend. Seeded rows are tagged and removable — lib/demoData.js.
 */
function SampleDataButton({ signedIn }) {
  const [loaded, setLoaded] = useState(hasDemoData)

  if (!usingMockApi || !signedIn) return null

  const toggle = () => {
    if (loaded) clearDemoData()
    else seedDemoData()

    setLoaded(!loaded)
    // Simplest reliable refresh of every hook reading practice history.
    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/15 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-accent/25"
    >
      <NavIcon name={loaded ? 'close' : 'plus'} className="h-4 w-4" />
      {loaded ? 'Clear sample data' : 'Load sample data'}
    </button>
  )
}

function ScoresPending() {
  return (
    <Panel className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <NavIcon name="mic" className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-primary">Scores need an interview answer</h2>
          <p className="mt-1 max-w-lg text-sm text-primary/60">
            Your exchange practice is counted above. Clarity, confidence, and STAR only come from AI
            scoring, so finish one mock interview to unlock the score charts.
          </p>
        </div>
      </div>

      <Link
        to="/interview"
        className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90"
      >
        Start a mock interview
      </Link>
    </Panel>
  )
}

const PREVIEW = [
  {
    icon: 'trend',
    title: 'AI score history',
    detail: 'How clarity, confidence, and STAR move over 7, 30, or 90 days.',
  },
  {
    icon: 'brain',
    title: 'Skill growth',
    detail: 'A radar of every scored axis, so weak spots are obvious at a glance.',
  },
  {
    icon: 'chart',
    title: 'Weekly activity',
    detail: 'Interview answers and timed language exchange, day by day.',
  },
  {
    icon: 'leaf',
    title: 'Practice streak',
    detail: 'A day-by-day heatmap of the last quarter and your current streak.',
  },
]

function AnalyticsEmpty() {
  return (
    <Panel className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
        <NavIcon name="analytics" className="h-7 w-7" />
      </span>

      <h2 className="mt-4 text-xl font-semibold text-primary">Nothing to analyse yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-primary/60">
        Finish a mock interview or a language exchange session and this page fills in on its own.
        Here is what you will get.
      </p>

      <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
        {PREVIEW.map((item) => (
          <div key={item.title} className="rounded-xl border border-primary/10 bg-surface p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-blue shadow-sm">
              <NavIcon name={item.icon} className="h-4 w-4" />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-primary">{item.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-primary/55">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/interview"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90"
        >
          <NavIcon name="mic" className="h-4 w-4" />
          Start a mock interview
        </Link>
        <Link
          to="/matching"
          className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-white px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
        >
          <NavIcon name="matching" className="h-4 w-4" />
          Find a language partner
        </Link>
      </div>
    </Panel>
  )
}
