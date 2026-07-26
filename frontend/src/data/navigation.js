/**
 * Single list of in-app destinations, shared by the sidebar and the topbar
 * search so a new route only has to be registered once.
 *
 * The two practice destinations sit second and third rather than in a section
 * of their own: sitting an interview and the passport it builds are what the
 * product is for, and a separate group below the fold made them look like
 * extras.
 */
export const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard', keywords: 'home overview progress' },
  {
    to: '/interview',
    icon: 'mic',
    label: 'AI Interview',
    keywords: 'ai mock interview record video question star practice',
  },
  {
    to: '/passport',
    icon: 'passport',
    label: 'Skill Passport',
    keywords: 'credential badge certificate scores milestones',
  },
  {
    to: '/practice',
    icon: 'coach',
    label: 'AI Trainer',
    keywords: 'coach trainer feedback practice communication grammar speaking',
  },
  { to: '/matching', icon: 'matching', label: 'Matching', keywords: 'peer language exchange partner' },
  { to: '/analytics', icon: 'analytics', label: 'Analytics', keywords: 'charts scores trends' },
  { to: '/resources', icon: 'resources', label: 'Resources', keywords: 'guides library reading' },
  { to: '/settings', icon: 'settings', label: 'Settings', keywords: 'profile photo appearance theme account' },
]

export function searchDestinations(query) {
  const term = query.trim().toLowerCase()
  if (!term) return []

  return NAV_ITEMS.filter((item) =>
    `${item.label} ${item.keywords}`.toLowerCase().includes(term)
  ).slice(0, 5)
}
