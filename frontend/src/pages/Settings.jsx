import AppShell from '../components/app/AppShell.jsx'
import Panel from '../components/dashboard/Panel.jsx'
import ProfileForm from '../components/profile/ProfileForm.jsx'
import { useUser } from '../context/UserContext.jsx'

export default function Settings() {
  const { user, profileCompleted, logout } = useUser()

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Settings</h1>
          <p className="mt-1 text-sm text-primary/60">
            Manage your profile and account details.
          </p>
        </div>

        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-primary">Profile</h2>
              <p className="mt-1 text-sm text-primary/60">
                We use this to tailor your interview questions and scoring.
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ${
                profileCompleted
                  ? 'bg-success/10 text-success ring-success/25'
                  : 'bg-accent/15 text-primary ring-accent/40'
              }`}
            >
              {profileCompleted ? 'Complete' : 'Incomplete'}
            </span>
          </div>

          <div className="mt-6">
            <ProfileForm
              includeName
              showReset
              submitLabel="Save changes"
              successMessage="Your profile has been updated."
            />
          </div>
        </Panel>

        <Panel>
          <h2 className="text-base font-semibold text-primary">Account</h2>

          <dl className="mt-4 divide-y divide-primary/10">
            <div className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <dt className="text-sm font-medium text-primary">Email address</dt>
                <dd className="text-sm text-primary/60">{user?.email}</dd>
              </div>
              <span className="text-xs text-primary/45">
                Changing your email is not available yet
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <dt className="text-sm font-medium text-primary">Password</dt>
                <dd className="text-sm text-primary/60">••••••••</dd>
              </div>
              <span className="text-xs text-primary/45">Password changes are not available yet</span>
            </div>
          </dl>

          <button
            type="button"
            onClick={logout}
            className="mt-4 rounded-lg border border-primary/15 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
          >
            Sign out
          </button>
        </Panel>
      </div>
    </AppShell>
  )
}
