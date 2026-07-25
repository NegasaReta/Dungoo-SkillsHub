import { Link } from 'react-router-dom'

import AppShell from '../components/app/AppShell.jsx'
import NavIcon from '../components/app/NavIcon.jsx'
import DailyGoalCard from '../components/dashboard/DailyGoalCard.jsx'
import GreetingCard from '../components/dashboard/GreetingCard.jsx'
import LearningGrowthCard from '../components/dashboard/LearningGrowthCard.jsx'
import ProfileBanner from '../components/dashboard/ProfileBanner.jsx'
import RecentActivitiesCard from '../components/dashboard/RecentActivitiesCard.jsx'
import SkillScoreCard from '../components/dashboard/SkillScoreCard.jsx'
import StreakCard from '../components/dashboard/StreakCard.jsx'
import SuggestionCard from '../components/dashboard/SuggestionCard.jsx'
import UpcomingCard from '../components/dashboard/UpcomingCard.jsx'
import { useUser } from '../context/UserContext.jsx'
import { dashboardData, greetingFor } from '../data/dashboard.js'

export default function Dashboard() {
  const { user, profileCompleted } = useUser()
  const {
    weeklyGoal,
    streak,
    skillScore,
    dailyGoal,
    suggestion,
    learningGrowth,
    upcoming,
    recentActivities,
  } = dashboardData

  return (
    <AppShell>
      <div className="space-y-5">
        {!profileCompleted && <ProfileBanner />}

        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <GreetingCard
              greeting={greetingFor()}
              name={user?.first_name}
              sessionsRemaining={weeklyGoal.sessionsRemaining}
              focusArea={weeklyGoal.focusArea}
            />
          </div>
          <div className="lg:col-span-4">
            <StreakCard days={streak.days} weekProgress={streak.weekProgress} />
          </div>

          <div className="sm:col-span-1 lg:col-span-3">
            <SkillScoreCard value={skillScore.value} changePercent={skillScore.changePercent} />
          </div>
          <div className="sm:col-span-1 lg:col-span-3">
            <DailyGoalCard
              completedMinutes={dailyGoal.completedMinutes}
              targetMinutes={dailyGoal.targetMinutes}
            />
          </div>
          <div className="lg:col-span-6">
            <SuggestionCard
              title={suggestion.title}
              description={suggestion.description}
              participants={suggestion.participants}
            />
          </div>

          <div className="lg:col-span-8">
            <LearningGrowthCard data={learningGrowth} />
          </div>
          <div className="lg:col-span-4">
            <UpcomingCard items={upcoming} />
          </div>

          <div className="lg:col-span-12">
            <RecentActivitiesCard activities={recentActivities} />
          </div>
        </div>
      </div>

      <Link
        to="/interview"
        aria-label="Start AI Interview"
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-white shadow-lg shadow-brand-blue/30 transition-transform hover:scale-105"
      >
        <NavIcon name="mic" />
      </Link>
    </AppShell>
  )
}
