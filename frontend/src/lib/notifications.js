/**
 * Notifications are derived from the signed-in account rather than invented, so
 * everything shown reflects real state from /auth/me. Read state is per user in
 * localStorage until there is a server-side notifications table.
 */
import { strings } from '../i18n/en.js'

const READ_KEY = 'dungoo.notifications.read'

function readStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_KEY) ?? '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function readIdsFor(userId) {
  const ids = readStore()[String(userId)]
  return Array.isArray(ids) ? ids : []
}

export function markAllRead(userId, ids) {
  const store = readStore()
  const existing = readIdsFor(userId)
  store[String(userId)] = [...new Set([...existing, ...ids])]
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(store))
  } catch {
    // Read state is a convenience only; private-mode storage failures are fine.
  }
}

export function markRead(userId, id) {
  markAllRead(userId, [id])
}

export function buildNotifications(user) {
  if (!user) return []

  const s = strings.notifications
  const items = [
    {
      id: 'welcome',
      icon: 'spark',
      title: s.welcomeTitle,
      body: s.welcomeBody,
      at: user.created_at,
    },
  ]

  if (user.profile_completed) {
    items.push(
      {
        id: 'profile-complete',
        icon: 'settings',
        title: s.profileDoneTitle,
        body: s.profileDoneBody,
        to: '/settings',
      },
      {
        id: 'first-interview',
        icon: 'mic',
        title: s.practiceTitle,
        body: s.practiceBody,
        to: '/interview',
        action: s.practiceAction,
      }
    )
  } else {
    items.push({
      id: 'profile-incomplete',
      icon: 'settings',
      title: s.profileTodoTitle,
      body: s.profileTodoBody,
      to: '/complete-profile',
      action: s.profileTodoAction,
      urgent: true,
    })
  }

  const read = readIdsFor(user.id)
  return items.map((item) => ({ ...item, unread: !read.includes(item.id) }))
}
