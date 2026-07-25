import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useUser } from '../../context/UserContext.jsx'
import { strings } from '../../i18n/en.js'
import { buildNotifications, markAllRead } from '../../lib/notifications.js'
import { relativeTime } from '../../lib/time.js'
import NavIcon from './NavIcon.jsx'
import TopbarMenu from './TopbarMenu.jsx'

const s = strings.notifications

function Row({ item, onNavigate }) {
  const body = (
    <>
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          item.urgent ? 'bg-accent/20 text-primary' : 'bg-surface text-primary/60'
        }`}
      >
        <NavIcon name={item.icon} className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">{item.title}</span>
          {item.unread && (
            <span
              aria-label="Unread"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue"
            />
          )}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-primary/60">{item.body}</span>
        <span className="mt-1 flex items-center gap-2">
          {item.at && <span className="text-[11px] text-primary/45">{relativeTime(item.at)}</span>}
          {item.action && (
            <span className="text-[11px] font-medium text-brand-blue">{item.action} →</span>
          )}
        </span>
      </span>
    </>
  )

  const className = `flex w-full gap-3 px-4 py-3 text-left transition-colors ${
    item.unread ? 'bg-brand-blue/[0.03]' : ''
  } hover:bg-surface`

  if (!item.to) {
    return <div className={className}>{body}</div>
  }

  return (
    <Link to={item.to} role="menuitem" onClick={onNavigate} className={className}>
      {body}
    </Link>
  )
}

export default function NotificationsMenu() {
  const { user } = useUser()
  // Bumped after marking read so the derived list recomputes.
  const [readVersion, setReadVersion] = useState(0)

  const items = useMemo(() => buildNotifications(user), [user, readVersion])
  const unreadCount = items.filter((item) => item.unread).length

  function handleMarkAllRead() {
    if (!user || !unreadCount) return
    markAllRead(
      user.id,
      items.map((item) => item.id)
    )
    setReadVersion((current) => current + 1)
  }

  return (
    <TopbarMenu
      label={s.title}
      width="w-80 sm:w-96"
      trigger={({ open }) => (
        <span
          className={`relative flex items-center rounded-lg p-2 transition-colors ${
            open ? 'bg-surface text-brand-blue' : 'text-primary/60 hover:text-brand-blue'
          }`}
        >
          <NavIcon name="bell" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-primary">
              {unreadCount}
            </span>
          )}
        </span>
      )}
    >
      {({ close }) => (
        <>
          <div className="flex items-center justify-between gap-2 border-b border-primary/10 px-4 py-3">
            <p className="text-sm font-semibold text-primary">{s.title}</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-brand-blue transition-opacity hover:opacity-80"
              >
                <NavIcon name="check" className="h-3.5 w-3.5" />
                {s.markAllRead}
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-primary/55">{s.signedOut}</p>
          ) : (
            <div className="max-h-96 divide-y divide-primary/10 overflow-y-auto">
              {items.map((item) => (
                <Row key={item.id} item={item} onNavigate={close} />
              ))}
            </div>
          )}

          {items.length > 0 && unreadCount === 0 && (
            <p className="border-t border-primary/10 px-4 py-2.5 text-center text-xs text-primary/50">
              {s.caughtUp}
            </p>
          )}
        </>
      )}
    </TopbarMenu>
  )
}
