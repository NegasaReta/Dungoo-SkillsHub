import { Link, NavLink } from 'react-router-dom'

import { NAV_ITEMS } from '../../data/navigation.js'
import { strings } from '../../i18n/en.js'
import NavIcon from './NavIcon.jsx'

/*
 * Colour is what sets the two practice destinations apart now that they sit in
 * the one list: they carry `tone: 'accent'` in the registry, everything else
 * reads blue. Gold only ever appears as a fill or an icon — as label text on a
 * light panel it would fall under 4.5:1.
 */
const TONES = {
  brand: {
    active: 'bg-brand-blue font-medium text-white shadow-sm shadow-brand-blue/30',
    idle: 'text-primary/70 hover:bg-brand-blue/10 hover:text-link',
    icon: 'text-link',
  },
  accent: {
    active: 'bg-accent font-medium text-navy shadow-sm shadow-accent/30',
    idle: 'text-primary/70 hover:bg-accent/15 hover:text-primary',
    icon: 'text-accent',
  },
}

export default function Sidebar({ onNavigate }) {
  const t = strings.sidebar

  // The gradient is a background *image* layered over the solid panel fill, so
  // the sidebar stays opaque while picking up a brand tint top and bottom.
  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-primary/10 bg-panel bg-gradient-to-b from-brand-blue/10 via-transparent to-accent/15 px-4 py-6">
      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-lg px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue font-bold text-white">
          D
        </span>
        <span className="font-semibold text-primary">
          Dungoo <span className="text-link">SkillsHub</span>
        </span>
      </Link>

      <nav className="mt-8 flex-1">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const palette = TONES[item.tone === 'accent' ? 'accent' : 'brand']

            return (
              <li key={item.to}>
                {/* NavLink marks the active route with aria-current for us. */}
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      isActive ? palette.active : palette.idle
                    } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <NavIcon
                        name={item.icon}
                        className={`h-5 w-5 ${isActive ? '' : palette.icon}`}
                      />
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* The primary action of the product, kept in reach from every page. */}
      <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-blue to-navy p-4 shadow-sm shadow-brand-blue/20">
        <p className="text-sm font-semibold text-white">{t.ctaTitle}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-white/70">{t.ctaBody}</p>
        <Link
          to="/interview"
          onClick={onNavigate}
          className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-navy transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <NavIcon name="mic" className="h-3.5 w-3.5" />
          {t.ctaAction}
        </Link>
      </div>
    </div>
  )
}
