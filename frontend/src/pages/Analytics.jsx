import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

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
import { useUser } from '../context/UserContext.jsx'
import useProgress from '../hooks/useProgress.js'
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
  const { sessions, summary, loading } = useProgress()
  const [rangeDays, setRangeDays] = useState(30)

  const history = useMemo(() => dailyActivity(sessions, rangeDays), [sessions, rangeDays])
  const thisWeek = useMemo(() => dailyActivity(sessions, 7), [sessions])
  const quarter = useMemo(() => dailyActivity(sessions, HEATMAP_DAYS), [sessions])
  const stats = useMemo(() => rangeStats(sessions, rangeDays), [sessions, rangeDays])
  const insights = useMemo(() => deriveInsights(summary, sessions), [summary, sessions])
  const roles = useMemo(() => roleBreakdown(sessions), [sessions])

  const countHint = (current, previous, noun) =>
    previous ? `${current - previous >= 0 ? '+' : ''}${current - previous} vs previous ${rangeDays} days` : `${noun} in the last ${rangeDays} days`

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
              Every number here comes from your scored interview answers — nothing is estimated.
            </p>
          </div>

          {summary.hasHistory && (
            <div className="flex flex-wrap items-center gap-2 print:hidden">
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
            </div>
          )}
        </div>

        {loading && (
          <Panel>
            <Loader label="Loading your analytics…" />
          </Panel>
        )}

        {!loading && !summary.hasHistory && <AnalyticsEmpty />}

        {!loading && summary.hasHistory && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon="chart"
                label="Sessions"
                value={stats.sessionCount}
                hint={countHint(stats.sessionCount, stats.previous.sessionCount, 'Sessions')}
              />
              <StatCard
                icon="audio"
                label="Answers scored"
                value={stats.answerCount}
                hint={countHint(stats.answerCount, stats.previous.answerCount, 'Answers')}
              />
              <StatCard
                icon="award"
                label="Average score"
                value={stats.average ? stats.average.toFixed(1) : '—'}
                suffix={`/ ${SCORE_MAX}`}
                changePercent={stats.changePercent}
                hint={
                  stats.previous.average
                    ? `Previously ${stats.previous.average.toFixed(1)}`
                    : 'No earlier period to compare'
                }
              />
              <StatCard
                icon="leaf"
                label="Current streak"
                value={summary.streakDays}
                suffix={summary.streakDays === 1 ? 'day' : 'days'}
                hint={`Lifetime average ${summary.overall.toFixed(1)} of ${SCORE_MAX}`}
              />
            </div>

            <ScoreHistoryChart activity={history} />

            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-4">
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
              <div className="lg:col-span-4">
                <InsightsPanel insights={insights} />
              </div>
              <div className="lg:col-span-4">
                <RoleBreakdown roles={roles} />
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <WeeklyActivityChart activity={thisWeek} />
              </div>
              <div className="lg:col-span-5">
                <GrowthMilestones milestones={deriveMilestones(summary, sessions, user)} />
              </div>
            </div>

            <PracticeHeatmap activity={quarter} streakDays={summary.streakDays} />
          </>
        )}
      </div>
    </AppShell>
  )
}

const PREVIEW = [
  {
    icon: 'trend',
    title: 'Score history',
    detail: 'How clarity, confidence, and STAR move over 7, 30, or 90 days.',
  },
  {
    icon: 'brain',
    title: 'Skill growth',
    detail: 'A radar of every scored axis, so weak spots are obvious at a glance.',
  },
  {
    icon: 'code',
    title: 'By role',
    detail: 'Which role you interview strongest for, once you practise more than one.',
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
        Finish one mock interview and this page fills in on its own. Here is what you will get.
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

      <Link
        to="/interview"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90"
      >
        <NavIcon name="mic" className="h-4 w-4" />
        Start a mock interview
      </Link>
    </Panel>
  )
}
