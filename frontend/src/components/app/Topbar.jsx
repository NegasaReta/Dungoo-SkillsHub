import { Link } from 'react-router-dom'

import { useUser } from '../../context/UserContext.jsx'
import NavIcon from './NavIcon.jsx'

function initialsFor(user) {
  const letters = [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('')
  return letters.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'
}

export default function Topbar({ onOpenSidebar }) {
  const { user, logout } = useUser()

  return (
    <header className="sticky top-0 z-30 border-b border-primary/10 bg-white/90 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          className="rounded-lg border border-primary/15 p-2 text-primary/70 transition-colors hover:text-primary lg:hidden"
        >
          <NavIcon name="menu" />
        </button>

        <label htmlFor="app-search" className="sr-only">
          Search skills, coaches, or lessons
        </label>
        <div className="relative max-w-md flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-primary/40">
            <NavIcon name="search" className="h-4 w-4" />
          </span>
          <input
            id="app-search"
            type="search"
            placeholder="Search skills, coaches, or lessons..."
            className="w-full rounded-full border border-primary/15 bg-surface py-2 pl-9 pr-4 text-sm text-primary outline-none transition-colors placeholder:text-primary/40 focus:border-brand-blue focus:bg-white"
          />
        </div>

        <nav className="ml-auto hidden items-center gap-6 md:flex">
          <a href="#explore" className="text-sm text-primary/70 transition-colors hover:text-brand-blue">
            Explore
          </a>
          <a
            href="#community"
            className="text-sm text-primary/70 transition-colors hover:text-brand-blue"
          >
            Community
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button
            type="button"
            aria-label="Notifications"
            className="rounded-lg p-2 text-primary/60 transition-colors hover:text-brand-blue"
          >
            <NavIcon name="bell" />
          </button>
          <button
            type="button"
            aria-label="Help"
            className="rounded-lg p-2 text-primary/60 transition-colors hover:text-brand-blue"
          >
            <NavIcon name="help" />
          </button>

          <Link
            to="/settings"
            aria-label="Account settings"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {initialsFor(user)}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="ml-1 hidden rounded-lg border border-primary/15 px-3 py-1.5 text-xs font-medium text-primary/70 transition-colors hover:text-primary sm:block"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
