import { Link } from 'react-router-dom'

import { strings } from '../../i18n/en.js'
import ThemeToggle from '../common/ThemeToggle.jsx'
import HelpMenu from './HelpMenu.jsx'
import NavIcon from './NavIcon.jsx'
import NotificationsMenu from './NotificationsMenu.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import SearchBox from './SearchBox.jsx'

export default function Topbar({ onOpenSidebar }) {
  return (
    <header className="sticky top-0 z-30 border-b border-primary/10 bg-panel/90 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label={strings.topbar.openNavigation}
          className="rounded-lg border border-primary/15 p-2 text-primary/70 transition-colors hover:bg-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue lg:hidden"
        >
          <NavIcon name="menu" />
        </button>

        <SearchBox />

        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          <Link
            to="/resources"
            className="text-sm text-primary/70 transition-colors hover:text-link"
          >
            {strings.topbar.explore}
          </Link>
          <Link
            to="/matching"
            className="text-sm text-primary/70 transition-colors hover:text-link"
          >
            {strings.topbar.community}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <ThemeToggle className="hidden sm:inline-flex" />
          <NotificationsMenu />
          <HelpMenu />
          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}
