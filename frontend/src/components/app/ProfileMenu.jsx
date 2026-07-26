import { Link } from 'react-router-dom'

import { useAvatar } from '../../context/AvatarContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useUser } from '../../context/UserContext.jsx'
import { useMenu } from '../../hooks/useMenu.js'
import { strings } from '../../i18n/en.js'
import Avatar from '../common/Avatar.jsx'
import MenuPanel from './MenuPanel.jsx'
import NavIcon from './NavIcon.jsx'

function displayName(user) {
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ')
  return name || user?.email?.split('@')[0] || 'Your account'
}

/**
 * The profile name is the only visible control; settings, appearance, and sign
 * out live in a popover that opens on hover, focus, or tap.
 */
export default function ProfileMenu() {
  const { user, logout } = useUser()
  const { avatar } = useAvatar()
  const { isDark, toggleTheme } = useTheme()
  const { open, toggleMenu, closeMenu, containerProps } = useMenu({ hover: true })

  return (
    <div className="relative" {...containerProps}>
      <button
        type="button"
        onClick={toggleMenu}
        aria-label={strings.topbar.account}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-transparent py-1 pl-1 pr-2 transition-colors hover:border-primary/15 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
      >
        <Avatar user={user} src={avatar} />
        <span className="hidden max-w-32 truncate text-sm font-medium text-primary sm:block">
          {displayName(user)}
        </span>
        <NavIcon
          name="chevron"
          className={`hidden h-4 w-4 text-primary/40 transition-transform sm:block ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <MenuPanel className="w-64" role="menu">
          <div className="flex items-center gap-3 border-b border-primary/10 px-4 py-3">
            <Avatar user={user} src={avatar} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-primary">{displayName(user)}</p>
              <p className="truncate text-xs text-primary/55">{user?.email}</p>
            </div>
          </div>

          <div className="p-1.5">
            <Link
              to="/settings"
              role="menuitem"
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-primary/80 transition-colors hover:bg-surface hover:text-primary"
            >
              <NavIcon name="settings" className="h-4 w-4" />
              {strings.account.manageAccount}
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-primary/80 transition-colors hover:bg-surface hover:text-primary"
            >
              <NavIcon name={isDark ? 'sun' : 'moon'} className="h-4 w-4" />
              <span className="flex-1 text-left">{strings.account.appearance}</span>
              <span className="text-xs text-primary/45">
                {isDark ? strings.theme.dark : strings.theme.light}
              </span>
            </button>
          </div>

          <div className="border-t border-primary/10 p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                closeMenu()
                logout()
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary/80 transition-colors hover:bg-accent/15 hover:text-primary"
            >
              <NavIcon name="logout" className="h-4 w-4" />
              {strings.account.signOut}
            </button>
          </div>
        </MenuPanel>
      )}
    </div>
  )
}
