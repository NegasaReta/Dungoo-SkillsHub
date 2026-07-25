import CredentialCard from './CredentialCard.jsx'
import Milestones from './Milestones.jsx'
import PassportNotes from './PassportNotes.jsx'
import ScoreRadarChart from './ScoreRadarChart.jsx'
import SessionHistory from './SessionHistory.jsx'
import SkillBreakdown from './SkillBreakdown.jsx'

export default function PassportView({ passport }) {
  return (
    <div className="space-y-5">
      <CredentialCard passport={passport} />

      <div className="grid gap-5 lg:grid-cols-2">
        <SkillBreakdown scores={passport.scores} />
        <ScoreRadarChart scores={passport.scores} />
      </div>

      <PassportNotes strengths={passport.strengths} focusAreas={passport.focus_areas} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Milestones milestones={passport.milestones} />
        {passport.history.length > 0 && <SessionHistory history={passport.history} />}
      </div>
    </div>
  )
}
