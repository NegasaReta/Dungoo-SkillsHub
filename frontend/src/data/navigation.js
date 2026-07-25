/**
 * Single list of in-app destinations, shared by the sidebar and the topbar
 * search so a new route only has to be registered once.
 */
export const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard', keywords: 'home overview progress' },
  { to: '/coach', icon: 'coach', label: 'AI Communication', keywords: 'coach feedback practice communication' },
  { to: '/matching', icon: 'matching', label: 'Matching', keywords: 'peer language exchange partner' },
  { to: '/analytics', icon: 'analytics', label: 'Analytics', keywords: 'charts scores trends' },
  { to: '/resources', icon: 'resources', label: 'Resources', keywords: 'guides library reading' },
  { to: '/settings', icon: 'settings', label: 'Settings', keywords: 'profile photo appearance theme account' },
]

export const QUICK_ACTIONS = [
  {
    to: '/interview',
    icon: 'mic',
    label: 'Mock Interview',
    keywords: 'mock interview record video question star practice',
  },
  {
    to: '/passport',
    icon: 'passport',
    label: 'Skill Passport',
    keywords: 'credential badge certificate scores milestones',
  },
]

const SEARCHABLE = [...QUICK_ACTIONS, ...NAV_ITEMS]

/**
 * The destination a path belongs to, so the topbar can name the current page.
 * Longest match wins, so a nested route still resolves to its section.
 */
export function destinationFor(pathname) {
  return SEARCHABLE.filter(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`)
  ).sort((a, b) => b.to.length - a.to.length)[0]
}

export function searchDestinations(query) {
  const term = query.trim().toLowerCase()
  if (!term) return []

  return SEARCHABLE.filter((item) =>
    `${item.label} ${item.keywords}`.toLowerCase().includes(term)
  ).slice(0, 5)
}
