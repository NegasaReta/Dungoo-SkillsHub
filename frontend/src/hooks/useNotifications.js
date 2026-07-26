import { useCallback, useMemo, useState } from 'react'

import { useUser } from '../context/UserContext.jsx'
import { buildNotifications, markAllRead as persistAllRead, markRead as persistRead } from '../lib/notifications.js'
import { relativeTime } from '../lib/time.js'

/**
 * Notifications are derived from the signed-in account rather than a static
 * feed, so nothing is shown that is not true of this user. Read state lives in
 * localStorage because the app shell, and therefore the topbar, remounts on
 * every route change.
 */
export function useNotifications() {
  const { user } = useUser()
  // Bumped after a write so the derived list recomputes from storage.
  const [readVersion, setReadVersion] = useState(0)

  const items = useMemo(
    () =>
      buildNotifications(user).map((item) => ({
        ...item,
        read: !item.unread,
        time: relativeTime(item.at),
      })),
    [user, readVersion]
  )

  const markAllRead = useCallback(() => {
    if (!user) return
    persistAllRead(
      user.id,
      items.map((item) => item.id)
    )
    setReadVersion((current) => current + 1)
  }, [user, items])

  const markRead = useCallback(
    (id) => {
      if (!user) return
      persistRead(user.id, id)
      setReadVersion((current) => current + 1)
    },
    [user]
  )

  return {
    items,
    unreadCount: items.filter((item) => !item.read).length,
    markAllRead,
    markRead,
  }
}

export default useNotifications
