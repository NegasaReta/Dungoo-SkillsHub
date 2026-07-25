import { useNavigate } from 'react-router-dom'

import { useMenu } from '../../hooks/useMenu.js'
import { useNotifications } from '../../hooks/useNotifications.js'
import { format, strings } from '../../i18n/en.js'
import MenuPanel from './MenuPanel.jsx'
import NavIcon from './NavIcon.jsx'

export default function NotificationsMenu() {
  const { open, toggleMenu, closeMenu, containerProps } = useMenu()
  const { items, unreadCount, markAllRead, markRead } = useNotifications()
  const navigate = useNavigate()

  function openNotification(item) {
    markRead(item.id)
    closeMenu()
    // Some notifications are informational and have nowhere to go.
    if (item.to) navigate(item.to)
  }

  return (
    <div className="relative" {...containerProps}>
      <button
        type="button"
        onClick={toggleMenu}
        aria-label={strings.notifications.label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative rounded-lg p-2 text-primary/60 transition-colors hover:bg-surface hover:text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
      >
        <NavIcon name="bell" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-navy">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <MenuPanel className="w-80 max-w-[calc(100vw-2rem)]">
          <div className="flex items-center justify-between gap-3 border-b border-primary/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-primary">{strings.notifications.title}</p>
              {unreadCount > 0 && (
                <p className="text-xs text-primary/55">
                  {format(strings.notifications.unreadCount, { count: unreadCount })}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="rounded-lg px-2 py-1 text-xs font-medium text-link transition-colors hover:bg-surface"
              >
                {strings.notifications.markAllRead}
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-primary/55">
              {strings.notifications.signedOut}
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openNotification(item)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface"
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        item.read
                          ? 'bg-surface text-primary/50'
                          : item.urgent
                            ? 'bg-accent/20 text-primary'
                            : 'bg-brand-blue/12 text-link'
                      }`}
                    >
                      <NavIcon name={item.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          className={`truncate text-sm ${
                            item.read ? 'text-primary/70' : 'font-semibold text-primary'
                          }`}
                        >
                          {item.title}
                        </span>
                        {!item.read && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-primary/55">
                        {item.body}
                      </span>
                      <span className="mt-1 flex items-center gap-2">
                        {item.time && (
                          <span className="text-[11px] text-primary/40">{item.time}</span>
                        )}
                        {item.action && (
                          <span className="text-[11px] font-medium text-link">
                            {item.action} &rarr;
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-primary/10 px-4 py-2.5">
            <button
              type="button"
              onClick={() => {
                closeMenu()
                navigate('/analytics')
              }}
              className="text-xs font-medium text-link transition-colors hover:underline"
            >
              {strings.notifications.viewAll}
            </button>
            {items.length > 0 && unreadCount === 0 && (
              <p className="text-xs text-primary/50">{strings.notifications.empty}</p>
            )}
          </div>
        </MenuPanel>
      )}
    </div>
  )
}
