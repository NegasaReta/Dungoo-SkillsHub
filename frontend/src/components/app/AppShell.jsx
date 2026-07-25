import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { strings } from '../../i18n/en.js'
import NavIcon from './NavIcon.jsx'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  // A route change means the drawer has done its job.
  useEffect(() => setSidebarOpen(false), [pathname])

  return (
    <div className="min-h-screen bg-canvas text-primary">
      <aside className="fixed inset-y-0 left-0 hidden w-60 lg:block">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={strings.topbar.closeNavigation}
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-navy/70"
          />
          <div className="absolute inset-y-0 left-0 w-64">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
            <button
              type="button"
              aria-label={strings.topbar.closeNavigation}
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-5 rounded-lg p-1.5 text-primary/50 transition-colors hover:text-primary"
            >
              <NavIcon name="close" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  )
}
