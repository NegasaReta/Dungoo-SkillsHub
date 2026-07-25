/**
 * Sample notification feed. Presentational only — swap for a real endpoint once
 * the backend exposes activity events.
 */
export const notificationFeed = [
  {
    id: 'n1',
    icon: 'spark',
    title: 'Your interview answer was scored',
    body: 'Clarity 4/5, Confidence 3/5. Tap to review the feedback.',
    time: '2 min ago',
    to: '/interview',
  },
  {
    id: 'n2',
    icon: 'target',
    title: 'Daily goal almost there',
    body: '18 minutes left to hit today’s 60-minute target.',
    time: '1 hr ago',
    to: '/dashboard',
  },
  {
    id: 'n3',
    icon: 'users',
    title: 'New language exchange match',
    body: 'Marta K. is available for a 40-minute session today.',
    time: 'Yesterday',
    to: '/matching',
  },
  {
    id: 'n4',
    icon: 'shield',
    title: 'Skill Passport updated',
    body: 'Two new scores were added to your credential.',
    time: '2 days ago',
    to: '/passport',
  },
]
