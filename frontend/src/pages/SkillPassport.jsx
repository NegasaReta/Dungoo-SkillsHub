import { useState } from 'react'
import { Link } from 'react-router-dom'

import AppShell from '../components/app/AppShell.jsx'
import NavIcon from '../components/app/NavIcon.jsx'
import Loader from '../components/common/Loader.jsx'
import Reveal from '../components/common/Reveal.jsx'
import Panel from '../components/dashboard/Panel.jsx'
import CredentialsGrid from '../components/passport/CredentialsGrid.jsx'
import GrowthMilestones from '../components/passport/GrowthMilestones.jsx'
import ProfileHeader from '../components/passport/ProfileHeader.jsx'
import SkillsProficiency from '../components/passport/SkillsProficiency.jsx'
import { useUser } from '../context/UserContext.jsx'
import useProgress from '../hooks/useProgress.js'
import {
  buildPassport,
  deriveCredentials,
  deriveMilestones,
  passportScores,
} from '../lib/progress.js'

export default function SkillPassport() {
  const { user } = useUser()
  const { sessions, summary, loading } = useProgress()
  const [shared, setShared] = useState(false)

  const passport = buildPassport(user, summary)

  /**
   * Public passport pages are not built yet, so this shares the credential id the
   * holder can quote. The share sheet is used where the browser offers one, which
   * on Android is the path most users will take.
   */
  async function share() {
    const text = `Dungoo Skill Passport ${passport.passportId} — ${passport.tier}, ${summary.overall.toFixed(1)} of 5 across ${summary.answerCount} scored interview answers.`

    try {
      if (navigator.share) {
        await navigator.share({ title: 'My Dungoo Skill Passport', text })
      } else {
        await navigator.clipboard.writeText(text)
      }
      setShared(true)
      setTimeout(() => setShared(false), 2500)
    } catch {
      // The user dismissed the share sheet, or the clipboard was blocked.
    }
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-link">
              Personal profile
            </p>
            <h1 className="mt-1 text-3xl font-bold text-primary">Skill Passport</h1>
            <p className="mt-2 max-w-xl text-sm text-primary/60">
              Your verified digital identity for the job marketplace — built automatically from
              every scored mock interview.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={share}
              disabled={!summary.hasHistory}
              className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-panel px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              <NavIcon name={shared ? 'verified' : 'share'} className="h-4 w-4" />
              {shared ? 'Copied' : 'Share'}
            </button>
            <button
              type="button"
              disabled={!summary.hasHistory}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <NavIcon name="download" className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>

        {loading ? (
          <Panel>
            <Loader label="Loading your session history…" />
          </Panel>
        ) : (
          <>
            {!summary.hasHistory && <EmptyPassportNotice />}

            <div className="grid gap-5 lg:grid-cols-12">
              <Reveal className="lg:col-span-7">
                <ProfileHeader user={user} passport={passport} />
              </Reveal>
              <Reveal delay={90} className="lg:col-span-5">
                <SkillsProficiency
                  scores={passportScores(summary)}
                  hasHistory={summary.hasHistory}
                />
              </Reveal>
              <Reveal delay={140} className="lg:col-span-7">
                <CredentialsGrid credentials={deriveCredentials(summary)} />
              </Reveal>
              <Reveal delay={190} className="lg:col-span-5">
                <GrowthMilestones milestones={deriveMilestones(summary, sessions, user)} />
              </Reveal>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}

function EmptyPassportNotice() {
  return (
    <Panel className="flex flex-wrap items-center justify-between gap-4 border border-accent/30 bg-accent/10">
      <div>
        <h2 className="text-base font-semibold text-primary">Your passport is empty</h2>
        <p className="mt-1 text-sm text-primary/70">
          Scores, credentials, and milestones fill in on their own once you finish a mock
          interview.
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
