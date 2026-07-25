import { Link } from 'react-router-dom'

import NavIcon from '../app/NavIcon.jsx'

export default function ProfileBanner() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/25 text-primary">
        <NavIcon name="spark" className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-primary">Complete your profile</p>
        <p className="mt-0.5 text-xs text-primary/70">
          Add your education, industries, and languages so we can tailor your interview questions.
        </p>
      </div>

      <Link
        to="/complete-profile"
        className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Finish setup
      </Link>
    </div>
  )
}
