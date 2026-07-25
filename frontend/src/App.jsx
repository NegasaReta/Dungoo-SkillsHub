import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Onboarding from './pages/Onboarding.jsx'
import InterviewSession from './pages/InterviewSession.jsx'
import SkillPassport from './pages/SkillPassport.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/interview" element={<InterviewSession />} />
      <Route path="/passport" element={<SkillPassport />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}
