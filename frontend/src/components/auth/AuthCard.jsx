import { Link } from 'react-router-dom'

import ThemeToggle from '../common/ThemeToggle.jsx'

export default function AuthCard({ title, subtitle, children, footer, wide = false }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-canvas px-4 py-12">
      {/* Same perspective horizon and light sources as the landing hero, so
          signing up does not feel like a different product. */}
      <div aria-hidden="true" className="scene-3d pointer-events-none absolute inset-0">
        <div className="grid-floor absolute inset-x-0 bottom-0 h-[380px]" />
      </div>
      <div
        aria-hidden="true"
        className="orb orb-blue pointer-events-none absolute -top-32 left-1/2 h-80 w-[38rem] -translate-x-1/2"
      />
      <div
        aria-hidden="true"
        className="orb orb-accent float-slower pointer-events-none absolute -bottom-24 -right-16 h-72 w-72"
      />

      <ThemeToggle className="absolute right-4 top-4 bg-panel/70 backdrop-blur sm:right-6 sm:top-6" />

      <Link to="/" className="relative mb-8 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue font-bold text-white">
          D
        </span>
        <span className="font-semibold text-primary">
          Dungoo <span className="text-link">SkillsHub</span>
        </span>
      </Link>

      <div className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="glass rounded-2xl p-6 shadow-xl shadow-navy/10 sm:p-8">
          <h1 className="text-2xl font-semibold text-primary">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-primary/60">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-primary/60">{footer}</div>}
      </div>
    </main>
  )
}
