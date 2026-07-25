import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { strings } from '../../i18n/en.js'
import NavIcon from './NavIcon.jsx'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const drawerRef = useRef(null)
  const openerRef = useRef(null)

  // A route change means the drawer has done its job.
  useEffect(() => setSidebarOpen(false), [pathname])

  /**
   * While the drawer covers the page it behaves like a dialog: Escape closes it,
   * the page behind it stops scrolling, and focus moves inside so a keyboard or
   * screen reader user is actually taken there. Closing hands focus back to the
   * button that opened it rather than dropping it at the top of the document.
   */
  useEffect(() => {
    if (!sidebarOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    drawerRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      openerRef.current?.focus()
    }
  }, [sidebarOpen])

  return (
    <div className="min-h-screen bg-canvas text-primary">
      {/* Without this every page starts with a tab through the whole sidebar. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand-blue focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        {strings.topbar.skipToContent}
      </a>

      {/* Navigation is dropped when printing so an exported page is just the content. */}
      <aside
        aria-label={strings.topbar.navigation}
        className="fixed inset-y-0 left-0 hidden w-60 lg:block print:hidden"
      >
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
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={strings.topbar.navigation}
            tabIndex={-1}
            className="absolute inset-y-0 left-0 w-64 outline-none"
          >
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
            <button
              type="button"
              aria-label={strings.topbar.closeNavigation}
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-5 rounded-lg p-1.5 text-primary/50 transition-colors hover:bg-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              <NavIcon name="close" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-60 print:pl-0">
        <div className="print:hidden">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} openerRef={openerRef} />
        </div>
        <main id="main-content" className="px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}
