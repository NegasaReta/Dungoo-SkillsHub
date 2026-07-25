import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import PracticeHeatmap from '../components/analytics/PracticeHeatmap.jsx'
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
import { dailyActivity, deriveMilestones, passportScores } from '../lib/progress.js'

const HEATMAP_DAYS = 91

export default function Analytics() {
  const { user } = useUser()
  const { sessions, summary, loading } = useProgress()
  const [rangeDays, setRangeDays] = useState(30)

  const history = useMemo(() => dailyActivity(sessions, rangeDays), [sessions, rangeDays])
  const thisWeek = useMemo(() => dailyActivity(sessions, 7), [sessions])
  const quarter = useMemo(() => dailyActivity(sessions, HEATMAP_DAYS), [sessions])

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

          <button
            type="button"
            onClick={() => window.print()}
            disabled={!summary.hasHistory}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-white px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            <NavIcon name="download" className="h-4 w-4" />
            Export PDF
          </button>
        </div>

        {loading ? (
          <Panel>
            <Loader label="Loading your analytics…" />
          </Panel>
        ) : (
          <>
            {!summary.hasHistory && <EmptyNotice />}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon="chart"
                label="Sessions completed"
                value={summary.sessionCount}
              />
              <StatCard icon="audio" label="Answers scored" value={summary.answerCount} />
              <StatCard
                icon="award"
                label="Avg AI score"
                value={summary.overall.toFixed(1)}
                suffix={`/ ${SCORE_MAX}`}
                changePercent={summary.changePercent}
              />
              <StatCard
                icon="leaf"
                label="Current streak"
                value={summary.streakDays}
                suffix={summary.streakDays === 1 ? 'day' : 'days'}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Panel className="h-full">
                  <h2 className="text-base font-semibold text-primary">Skill Growth</h2>
                  <p className="mt-1 text-xs text-primary/60">
                    {summary.hasHistory
                      ? `Strongest: ${summary.strongest.label} · weakest: ${summary.weakest.label}`
                      : 'Scored on every answer you submit'}
                  </p>
                  <div className="mt-4">
                    <ScoreRadarChart scores={passportScores(summary)} />
                  </div>
                </Panel>
              </div>
              <div className="lg:col-span-7">
                <ScoreHistoryChart
                  activity={history}
                  rangeDays={rangeDays}
                  onRangeChange={setRangeDays}
                />
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

function EmptyNotice() {
  return (
    <Panel className="flex flex-wrap items-center justify-between gap-4 border border-accent/30 bg-accent/10">
      <div>
        <h2 className="text-base font-semibold text-primary">No data to analyse yet</h2>
        <p className="mt-1 text-sm text-primary/70">
          These charts fill in from your interview scores. The layout below shows what you will
          see.
        </p>
      </div>
      <Link
        to="/interview"
        className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90"
      >
        <NavIcon name="mic" className="h-4 w-4" />
        Start a mock interview
      </Link>
    </Panel>
  )
}
