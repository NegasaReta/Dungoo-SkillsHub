/**
 * Placeholder dashboard content. Everything here is presentational sample data
 * from the design and should be replaced by real API responses once the
 * backend exposes progress, scheduling, and activity endpoints.
 */
export const dashboardData = {
  weeklyGoal: { sessionsRemaining: 2, focusArea: 'Advanced Algorithms' },
  streak: { days: 12, weekProgress: [true, true, true, false, false] },
  skillScore: { value: 842, changePercent: 4.2 },
  dailyGoal: { completedMinutes: 42, targetMinutes: 60 },
  suggestion: {
    title: 'Next up: Advanced Interview Prep',
    description:
      'Tailored based on your recent performance in "System Design Deep Dive" and your focus areas.',
    participants: ['JD', 'MK'],
  },
  learningGrowth: [
    { day: 'W1', value: 38 },
    { day: 'W2', value: 44 },
    { day: 'W3', value: 41 },
    { day: 'W4', value: 58 },
    { day: 'W5', value: 55 },
    { day: 'W6', value: 71 },
    { day: 'W7', value: 79 },
    { day: 'W8', value: 92 },
  ],
  upcoming: [
    { id: 1, month: 'Oct', day: '24', title: 'System Design Deep Dive', time: '14:00 - 15:30' },
    { id: 2, month: 'Oct', day: '25', title: 'Mock HR Interview', time: '10:00 - 11:00' },
    { id: 3, month: 'Oct', day: '27', title: 'Portfolio Review', time: '16:30 - 17:30' },
  ],
  recentActivities: [
    {
      id: 1,
      name: 'SQL Optimization Techniques',
      category: 'Database Engineering',
      duration: '45 min',
      score: 92,
      date: 'Today, 08:45 AM',
      status: 'completed',
    },
    {
      id: 2,
      name: 'Technical Communication',
      category: 'Soft Skills',
      duration: '25 min',
      score: 88,
      date: 'Yesterday, 04:20 PM',
      status: 'completed',
    },
    {
      id: 3,
      name: 'React Architecture (v18)',
      category: 'Web Development',
      duration: '12 min',
      score: null,
      date: 'Oct 21, 11:15 AM',
      status: 'in_progress',
    },
  ],
}

export function greetingFor(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
