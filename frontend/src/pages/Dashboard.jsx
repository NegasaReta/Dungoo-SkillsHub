import { Link } from 'react-router-dom'

import AppShell from '../components/app/AppShell.jsx'
import NavIcon from '../components/app/NavIcon.jsx'
import Loader from '../components/common/Loader.jsx'
import DailyGoalCard from '../components/dashboard/DailyGoalCard.jsx'
import GreetingCard from '../components/dashboard/GreetingCard.jsx'
import LearningGrowthCard from '../components/dashboard/LearningGrowthCard.jsx'
import Panel from '../components/dashboard/Panel.jsx'
import ProfileBanner from '../components/dashboard/ProfileBanner.jsx'
import RecentActivitiesCard from '../components/dashboard/RecentActivitiesCard.jsx'
import ScoreBreakdownCard from '../components/dashboard/ScoreBreakdownCard.jsx'
import SkillScoreCard from '../components/dashboard/SkillScoreCard.jsx'
import StreakCard from '../components/dashboard/StreakCard.jsx'
import SuggestionCard from '../components/dashboard/SuggestionCard.jsx'
import { SCORE_MAX } from '../constants.js'
import { useUser } from '../context/UserContext.jsx'
import useProgress from '../hooks/useProgress.js'
import { greetingFor } from '../lib/greeting.js'
import { DAILY_ANSWER_GOAL, WEEKLY_SESSION_GOAL } from '../lib/progress.js'

/** Turns the weakest scored axis into the next thing to work on. */
const SUGGESTIONS = {
  Clarity: {
    title: 'Next up: tighten your delivery',
    description:
      'Your clarity score is the one to lift. Keep answers to short sentences and cut filler words — re-run a session and watch the score move.',
  },
  Confidence: {
    title: 'Next up: drop the hedging',
    description:
      'Confidence scores lowest for you. Replace "I think" and "maybe" with what you actually did, and claim your own work.',
  },
  STAR: {
    title: 'Next up: finish the story',
    description:
      'Your STAR structure has the most room. Name the situation, your task, your actions, then the result — in that order.',
  },
}

const FIRST_SESSION_SUGGESTION = {
  title: 'Next up: your first mock interview',
  description:
    'Pick a role, answer three questions on camera, and get scored on clarity, confidence, and STAR structure.',
}

export default function Dashboard() {
  const { user, profileCompleted } = useUser()
  const { summary, loading } = useProgress()

  const suggestion = summary.hasHistory
    ? (SUGGESTIONS[summary.weakest.label] ?? FIRST_SESSION_SUGGESTION)
    : FIRST_SESSION_SUGGESTION

  return (
    <AppShell>
      <div className="space-y-5">
        {!profileCompleted && <ProfileBanner />}

        {loading ? (
          <Panel>
            <Loader label="Loading your progress…" />
          </Panel>
        ) : (
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <GreetingCard
                greeting={greetingFor()}
                name={user?.first_name}
                sessionsRemaining={Math.max(0, WEEKLY_SESSION_GOAL - summary.sessionsThisWeek)}
                focusArea={summary.hasHistory ? summary.weakest.label : 'interview practice'}
              />
            </div>
            <div className="lg:col-span-4">
              <StreakCard days={summary.streakDays} weekProgress={summary.weekProgress} />
            </div>

            <div className="sm:col-span-1 lg:col-span-3">
              <SkillScoreCard
                label="Overall Interview Score"
                value={summary.overall.toFixed(1)}
                outOf={SCORE_MAX}
                changePercent={summary.changePercent}
              />
            </div>
            <div className="sm:col-span-1 lg:col-span-3">
              <DailyGoalCard
                label="Daily Goal"
                completed={summary.answersToday}
                target={DAILY_ANSWER_GOAL}
                unit="Answers scored"
              />
            </div>
            <div className="lg:col-span-6">
              <SuggestionCard title={suggestion.title} description={suggestion.description} />
            </div>

            <div className="lg:col-span-8">
              <LearningGrowthCard data={summary.growth} />
            </div>
            <div className="lg:col-span-4">
              <ScoreBreakdownCard averages={summary.averages} hasHistory={summary.hasHistory} />
            </div>

            <div className="lg:col-span-12">
              <RecentActivitiesCard activities={summary.activities} />
            </div>
          </div>
        )}
      </div>

      <Link
        to="/interview"
        aria-label="Start a mock interview"
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-white shadow-lg shadow-brand-blue/30 transition-transform hover:scale-105"
      >
        <NavIcon name="mic" />
      </Link>
    </AppShell>
  )
}
