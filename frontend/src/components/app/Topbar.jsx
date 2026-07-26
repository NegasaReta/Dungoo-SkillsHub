import { useLocation } from 'react-router-dom'

import { destinationFor } from '../../data/navigation.js'
import { strings } from '../../i18n/en.js'
import ThemeToggle from '../common/ThemeToggle.jsx'
import HelpMenu from './HelpMenu.jsx'
import NavIcon from './NavIcon.jsx'
import NotificationsMenu from './NotificationsMenu.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import SearchBox from './SearchBox.jsx'

export default function Topbar({ onOpenSidebar, openerRef }) {
  const { pathname } = useLocation()
  const current = destinationFor(pathname)

  // The gradient rides on top of the panel fill, so the bar keeps its own
  // background instead of letting content show through as you scroll.
  return (
    <header className="sticky top-0 z-30 bg-panel/90 bg-gradient-to-r from-brand-blue/10 via-transparent to-accent/10 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          ref={openerRef}
          type="button"
          onClick={onOpenSidebar}
          aria-label={strings.topbar.openNavigation}
          className="rounded-lg border border-brand-blue/25 p-2 text-link transition-colors hover:bg-brand-blue/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue lg:hidden"
        >
          <NavIcon name="menu" />
        </button>

        {/* On mobile the sidebar is hidden, so this is the only thing naming the
            page you are on. */}
        {current && (
          <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-primary">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-link">
              <NavIcon name={current.icon} className="h-4 w-4" />
            </span>
            <span className="truncate">{current.label}</span>
          </p>
        )}

        <div className="ml-auto flex items-center gap-1 sm:ml-0 sm:flex-1 sm:justify-end sm:gap-3">
          <SearchBox className="hidden sm:block" />
          <ThemeToggle className="hidden sm:inline-flex" />
          <NotificationsMenu />
          <HelpMenu />
          <ProfileMenu />
        </div>
      </div>

      {/* Search gets its own row on small screens rather than being dropped. */}
      <div className="px-4 pb-3 sm:hidden">
        <SearchBox />
      </div>

      <div
        aria-hidden="true"
        className="h-px bg-gradient-to-r from-brand-blue via-accent to-brand-blue"
      />
    </header>
  )
}
