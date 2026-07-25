import { Link, NavLink } from 'react-router-dom'

import NavIcon from './NavIcon.jsx'

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/interview', icon: 'mic', label: 'Mock Interview' },
  { to: '/coach', icon: 'coach', label: 'AI Coach' },
  { to: '/matching', icon: 'matching', label: 'Matching' },
  { to: '/passport', icon: 'passport', label: 'Skill Passport' },
  { to: '/analytics', icon: 'analytics', label: 'Analytics' },
  { to: '/resources', icon: 'resources', label: 'Resources' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
]

export default function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col border-r border-primary/10 bg-white px-4 py-6">
      <Link to="/" className="flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue font-bold text-white">
          D
        </span>
        <span className="font-semibold text-primary">
          Dungoo <span className="text-brand-blue">SkillsHub</span>
        </span>
      </Link>

      <nav className="mt-8 flex-1">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-blue font-medium text-white'
                      : 'text-primary/70 hover:bg-surface hover:text-primary'
                  }`
                }
              >
                <NavIcon name={item.icon} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="rounded-2xl border border-primary/10 bg-surface p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/50">
          Pro plan
        </p>
        <p className="mt-2 text-xs leading-relaxed text-primary/60">
          Unlock advanced AI feedback and skill certification.
        </p>
        <button
          type="button"
          className="mt-3 w-full rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-accent/90"
        >
          Upgrade to Pro
        </button>
      </div>
    </div>
  )
}
