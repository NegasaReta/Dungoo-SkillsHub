import { Navigate, Route, Routes } from 'react-router-dom'
import Onboarding from './pages/Onboarding.jsx'
import InterviewSession from './pages/InterviewSession.jsx'
import SkillPassport from './pages/SkillPassport.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CommunicationPractice from './pages/CommunicationPractice.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/onboarding" replace />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/interview" element={<InterviewSession />} />
      <Route path="/passport" element={<SkillPassport />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/practice" element={<CommunicationPractice />} />
    </Routes>
  )
}
