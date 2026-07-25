import { Link, useNavigate } from 'react-router-dom'

import AppShell from '../components/app/AppShell.jsx'
import Panel from '../components/dashboard/Panel.jsx'
import ProfileForm from '../components/profile/ProfileForm.jsx'

export default function CompleteProfile() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Panel>
          <h1 className="text-2xl font-semibold text-primary">Complete your profile</h1>
          <p className="mt-2 text-sm text-primary/60">
            This helps us tailor your interview questions and scoring. You can change any of it
            later in Settings.
          </p>

          <div className="mt-6">
            <ProfileForm
              submitLabel="Save profile"
              onSaved={() => navigate('/dashboard', { replace: true })}
              secondaryAction={
                <Link
                  to="/dashboard"
                  className="text-sm text-primary/60 transition-colors hover:text-primary"
                >
                  Skip for now
                </Link>
              }
            />
          </div>
        </Panel>
      </div>
    </AppShell>
  )
}
