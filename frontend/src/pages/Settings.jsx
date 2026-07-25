import AppShell from '../components/app/AppShell.jsx'
import NavIcon from '../components/app/NavIcon.jsx'
import Panel from '../components/dashboard/Panel.jsx'
import ThemeChoice from '../components/common/ThemeChoice.jsx'
import AvatarUploader from '../components/profile/AvatarUploader.jsx'
import ProfileForm from '../components/profile/ProfileForm.jsx'
import { useUser } from '../context/UserContext.jsx'
import { strings } from '../i18n/en.js'

export default function Settings() {
  const { user, profileCompleted, logout } = useUser()

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{strings.settings.title}</h1>
          <p className="mt-1 text-sm text-primary/60">{strings.settings.subtitle}</p>
        </div>

        <Panel>
          <h2 className="text-base font-semibold text-primary">{strings.settings.photoTitle}</h2>
          <div className="mt-4">
            <AvatarUploader />
          </div>
        </Panel>

        <Panel>
          <h2 className="text-base font-semibold text-primary">
            {strings.settings.appearanceTitle}
          </h2>
          <p className="mt-1 text-sm text-primary/60">{strings.theme.description}</p>
          <div className="mt-4">
            <ThemeChoice />
          </div>
        </Panel>

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
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/15 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
          >
            <NavIcon name="logout" className="h-4 w-4" />
            {strings.account.signOut}
          </button>
        </Panel>
      </div>
    </AppShell>
  )
}
