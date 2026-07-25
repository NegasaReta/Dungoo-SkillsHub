import { useState } from 'react'

import NavIcon from './NavIcon.jsx'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface text-primary">
      {/* Navigation is dropped when printing so an exported page is just the content. */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 lg:block print:hidden">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-y-0 left-0 w-64">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-5 rounded-lg p-1.5 text-primary/50 hover:text-primary"
            >
              <NavIcon name="close" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-60 print:pl-0">
        <div className="print:hidden">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        </div>
        <main className="px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  )
}
