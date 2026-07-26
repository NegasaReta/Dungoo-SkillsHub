import { Link } from 'react-router-dom'

import { useMenu } from '../../hooks/useMenu.js'
import { strings } from '../../i18n/en.js'
import MenuPanel from './MenuPanel.jsx'
import NavIcon from './NavIcon.jsx'

const LINKS = [
  { to: '/interview', icon: 'mic', key: 'startInterview' },
  { to: '/passport', icon: 'shield', key: 'viewPassport' },
  { to: '/settings', icon: 'user', key: 'editProfile' },
]

export default function HelpMenu() {
  const { open, toggleMenu, closeMenu, containerProps } = useMenu()

  return (
    <div className="relative" {...containerProps}>
      <button
        type="button"
        onClick={toggleMenu}
        aria-label={strings.topbar.help}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-lg p-2 text-primary/60 transition-colors hover:bg-surface hover:text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
      >
        <NavIcon name="help" />
      </button>

      {open && (
        <MenuPanel className="w-72 max-w-[calc(100vw-2rem)]" role="menu">
          <p className="border-b border-primary/10 px-4 py-3 text-sm font-semibold text-primary">
            {strings.help.title}
          </p>

          <div className="p-1.5">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                role="menuitem"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-primary/80 transition-colors hover:bg-surface hover:text-primary"
              >
                <NavIcon name={link.icon} className="h-4 w-4 text-primary/45" />
                {strings.help[link.key]}
              </Link>
            ))}
          </div>

          <div className="border-t border-primary/10 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/45">
              {strings.help.shortcutsTitle}
            </p>
            <ul className="mt-2 space-y-1.5">
              {strings.help.shortcuts.map((shortcut) => (
                <li key={shortcut} className="text-xs leading-relaxed text-primary/60">
                  {shortcut}
                </li>
              ))}
            </ul>
          </div>
        </MenuPanel>
      )}
    </div>
  )
}
