import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import DemoModeBadge from './components/common/DemoModeBadge.jsx'
import Loader from './components/common/Loader.jsx'
import { AvatarProvider } from './context/AvatarContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { UserProvider, useUser } from './context/UserContext.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Signup from './pages/Signup.jsx'

// The signed-in app pulls in charting and the dashboard shell, so it is split
// out of the bundle that visitors download for the landing and auth pages.
const Analytics = lazy(() => import('./pages/Analytics.jsx'))
const ComingSoon = lazy(() => import('./pages/ComingSoon.jsx'))
const CommunicationPractice = lazy(() => import('./pages/CommunicationPractice.jsx'))
const CompleteProfile = lazy(() => import('./pages/CompleteProfile.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const InterviewSession = lazy(() => import('./pages/InterviewSession.jsx'))
const Matching = lazy(() => import('./pages/Matching.jsx'))
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'))
const Resources = lazy(() => import('./pages/Resources.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const SkillPassport = lazy(() => import('./pages/SkillPassport.jsx'))

function ScreenLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas">
      <Loader />
    </main>
  )
}

function Protected({ children }) {
  const { bootstrapping, user } = useUser()

  if (bootstrapping) return <ScreenLoader />
  if (!user) return <Navigate to="/signup" replace />

  return children
}

/**
 * The profile step is no longer a gate: users land on the dashboard straight
 * after signup and are nudged there by a banner. This route only redirects
 * users who have already finished it.
 */
function ProfileStep() {
  const { bootstrapping, user } = useUser()

  if (bootstrapping) return <ScreenLoader />
  if (!user) return <Navigate to="/signup" replace />
  if (user.profile_completed) return <Navigate to="/dashboard" replace />

  return <CompleteProfile />
}

function GuestOnly({ children }) {
  const { bootstrapping, user } = useUser()

  if (bootstrapping) return <ScreenLoader />
  if (user) return <Navigate to="/dashboard" replace />

  return children
}

const PLACEHOLDER_ROUTES = [{ path: '/coach', title: 'AI Trainer' }]

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        path="/signup"
        element={
          <GuestOnly>
            <Signup />
          </GuestOnly>
        }
      />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <GuestOnly>
            <ForgotPassword />
          </GuestOnly>
        }
      />
      <Route
        path="/reset-password"
        element={
          <GuestOnly>
            <ResetPassword />
          </GuestOnly>
        }
      />

      <Route path="/complete-profile" element={<ProfileStep />} />

      <Route
        path="/settings"
        element={
          <Protected>
            <Settings />
          </Protected>
        }
      />

      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />

      <Route
        path="/matching"
        element={
          <Protected>
            <Matching />
          </Protected>
        }
      />

      <Route
        path="/analytics"
        element={
          <Protected>
            <Analytics />
          </Protected>
        }
      />

      <Route
        path="/resources"
        element={
          <Protected>
            <Resources />
          </Protected>
        }
      />

      <Route
        path="/practice"
        element={
          <Protected>
            <CommunicationPractice />
          </Protected>
        }
      />

      {PLACEHOLDER_ROUTES.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <Protected>
              <ComingSoon title={route.title} />
            </Protected>
          }
        />
      ))}

      <Route
        path="/onboarding"
        element={
          <Protected>
            <Onboarding />
          </Protected>
        }
      />
      <Route
        path="/interview"
        element={
          <Protected>
            <InterviewSession />
          </Protected>
        }
      />
      <Route
        path="/passport"
        element={
          <Protected>
            <SkillPassport />
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AvatarProvider>
          <Suspense fallback={<ScreenLoader />}>
            <AppRoutes />
          </Suspense>
          <DemoModeBadge />
        </AvatarProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
