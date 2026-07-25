import { useCallback, useMemo, useState } from 'react'

import { notificationFeed } from '../data/notifications.js'

const READ_KEY = 'dungoo.notifications.read'

function readIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist(ids) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(ids))
  } catch {
    // Read state is a convenience only; ignore storage failures.
  }
}

/**
 * Read state is kept in localStorage because the app shell (and therefore the
 * topbar) remounts on every route change.
 */
export function useNotifications() {
  const [readIdList, setReadIdList] = useState(readIds)

  const markAllRead = useCallback(() => {
    const ids = notificationFeed.map((item) => item.id)
    setReadIdList(ids)
    persist(ids)
  }, [])

  const markRead = useCallback((id) => {
    setReadIdList((current) => {
      if (current.includes(id)) return current
      const next = [...current, id]
      persist(next)
      return next
    })
  }, [])

  const items = useMemo(
    () => notificationFeed.map((item) => ({ ...item, read: readIdList.includes(item.id) })),
    [readIdList]
  )

  return {
    items,
    unreadCount: items.filter((item) => !item.read).length,
    markAllRead,
    markRead,
  }
}

export default useNotifications
