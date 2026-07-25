import { Link } from 'react-router-dom'

import { useUser } from '../../context/UserContext.jsx'
import NavIcon from './NavIcon.jsx'
import TopbarMenu from './TopbarMenu.jsx'

function initialsFor(user) {
  const letters = [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('')
  return letters.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'
}

/**
 * Account menu behind the avatar. Signing out lives here and in Settings rather
 * than sitting in the topbar, where it was one stray click away at all times.
 */
export default function ProfileMenu() {
  const { user, logout } = useUser()
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ')

  const itemClassName =
    'flex w-full items-center justify-center gap-2.5 px-4 py-2.5 text-center text-sm text-primary transition-colors hover:bg-surface'

  return (
    <TopbarMenu
      label="Account menu"
      width="w-60"
      trigger={({ open }) => (
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue text-sm font-semibold text-white transition-opacity hover:opacity-90 ${
            open ? 'ring-2 ring-brand-blue/30' : ''
          }`}
        >
          {initialsFor(user)}
        </span>
      )}
    >
      {({ close }) => (
        <>
          <div className="border-b border-primary/10 px-4 py-3 text-center">
            {fullName && <p className="truncate text-sm font-medium text-primary">{fullName}</p>}
            <p className="truncate text-xs text-primary/55">{user?.email}</p>
          </div>

          <Link to="/settings" role="menuitem" onClick={close} className={itemClassName}>
            <NavIcon name="settings" className="h-4 w-4 text-primary/60" />
            Settings
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close()
              logout()
            }}
            className={`${itemClassName} border-t border-primary/10`}
          >
            <NavIcon name="logout" className="h-4 w-4 text-primary/60" />
            Sign out
          </button>
        </>
      )}
    </TopbarMenu>
  )
}
