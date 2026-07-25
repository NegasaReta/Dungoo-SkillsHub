/**
 * Demo history for the deployed demo build (mock API only).
 *
 * This exists so the progress pages can be shown filled in on stage without a
 * backend and without waiting through a live scoring run. Two rules keep it honest:
 *
 *  1. Scores are NOT written by hand. Every seeded answer is a real transcript run
 *     through the same heuristic scorer a live mock answer goes through, so the
 *     numbers on the charts are computed from the text below.
 *  2. Every seeded row is tagged `demo: true` and can be cleared in one click,
 *     so it can never be mistaken for something the user actually practised.
 */
import { buildResponse, hasDemoSessions, importSessions, removeDemoSessions } from '../api/mockInterview.js'
import { currentUserId } from '../api/mockApi.js'
import { PEERS } from '../data/matching.js'
import {
  hasDemoExchangeSessions,
  importExchangeSessions,
  removeDemoExchangeSessions,
} from './exchange.js'

function at(daysAgo, hour = 19, minute = 0) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

/**
 * Transcripts get stronger over time — earlier answers hedge, ramble, and skip
 * STAR parts — so the trend lines slope the way a practising user's would.
 */
const SESSIONS = [
  {
    daysAgo: 24,
    role: 'software-engineer',
    answers: [
      {
        questionId: 'swe-1',
        transcript:
          'Um, so basically I think there was a bug in the checkout page. I guess it was maybe a caching thing. I looked at it for a while and it sort of went away after we deployed again.',
      },
      {
        questionId: 'swe-2',
        transcript:
          'You know, I think my team wanted to use a different database. I was not sure it was right. We talked about it and, um, we ended up going with their idea probably.',
      },
    ],
  },
  {
    daysAgo: 17,
    role: 'software-engineer',
    answers: [
      {
        questionId: 'swe-1',
        transcript:
          'Last year we were getting reports that a few users lost their cart items. My task was to find out why before the holiday sale. So I added logging around the session handler and reproduced it on a slow connection. It turned out two requests were writing the same key. I changed it to a single write and the reports stopped.',
      },
      {
        questionId: 'swe-2',
        transcript:
          'During a sprint my team wanted to rewrite the payment module. I had to argue for a smaller change because the deadline was three weeks. So I wrote a short document comparing both options with the risk of each. In the end we patched the module and scheduled the rewrite for the next quarter.',
      },
      {
        questionId: 'swe-3',
        transcript:
          'I think I shipped a small internal dashboard. Um, it took about a month and people used it. I would maybe write more tests next time.',
      },
    ],
  },
  {
    daysAgo: 9,
    role: 'data-analyst',
    answers: [
      {
        questionId: 'da-1',
        transcript:
          'When I was interning at a logistics company the sales team believed late deliveries came from one warehouse. My task was to check that before they moved staff around. First I cleaned three months of delivery logs, then I compared delay rates by route rather than by warehouse. As a result we found the delays sat with two long routes, and the team changed the schedule instead of moving people.',
      },
      {
        questionId: 'da-2',
        transcript:
          'We were given a survey export where half the dates were text and some rows were duplicated. The goal was a weekly report the manager could trust. So I wrote a cleaning script that standardised the dates and flagged duplicates for review instead of deleting them silently. In the end the weekly report was reduced from two days of manual work to about twenty minutes.',
      },
    ],
  },
  {
    daysAgo: 3,
    role: 'software-engineer',
    answers: [
      {
        questionId: 'swe-1',
        transcript:
          'When I joined a small team we had a bug where uploaded photos appeared rotated for some phones. My task was to fix it without breaking older uploads. First I collected the failing files and read their orientation data. Then I wrote a test for each case and corrected the rotation at upload time. As a result support tickets about photos dropped to zero the following week.',
      },
      {
        questionId: 'swe-2',
        transcript:
          'Last year my team decided to skip code review to move faster. I needed to raise it without sounding like I was blocking everyone. So I tracked how many bugs reached production over two weeks and brought the numbers to our standup. In the end we agreed on short reviews for anything touching payments, and the escaped bugs reduced by half.',
      },
      {
        questionId: 'swe-3',
        transcript:
          'I built a student attendance tool for my department end to end. My task was the whole thing, from the database to the printed report. First I interviewed two administrators, then I wrote the schema and the report screen they asked for. As a result three hundred students were tracked in the first term, and I would change the schema to handle transfers between classes.',
      },
    ],
  },
  {
    daysAgo: 1,
    role: 'software-engineer',
    answers: [
      {
        questionId: 'swe-3',
        transcript:
          'When our club website kept going down I was asked to own it. My task was to keep it up during registration week. First I moved the images off the server, then I added a simple cache in front of the busiest page. As a result the site handled registration week without going down, and load time improved from four seconds to under one.',
      },
      {
        questionId: 'swe-2',
        transcript:
          'During a group project we were split on whether to use a framework nobody knew. I had to make the case for something we could finish. So I built a rough version in both over one weekend and showed the team how far each got. In the end we chose the familiar tool and submitted the project on time.',
      },
    ],
  },
]

/** Exchange practice is timed, so these carry the minutes the charts report. */
const EXCHANGES = [
  { daysAgo: 12, peerId: 1, minutes: 22 },
  { daysAgo: 6, peerId: 2, minutes: 40 },
  { daysAgo: 4, peerId: 3, minutes: 18 },
  { daysAgo: 2, peerId: 1, minutes: 35 },
  { daysAgo: 1, peerId: 6, minutes: 25 },
  { daysAgo: 0, peerId: 2, minutes: 15 },
]

export function hasDemoData() {
  return hasDemoSessions() || hasDemoExchangeSessions()
}

export function seedDemoData() {
  const userId = currentUserId()
  if (!userId) throw new Error('Sign in before loading demo data.')

  clearDemoData()

  importSessions(
    SESSIONS.map(({ daysAgo, role, answers }) => ({
      id: `demo-${daysAgo}-${role}`,
      user_id: userId,
      role,
      status: 'completed',
      demo: true,
      created_at: at(daysAgo),
      completed_at: at(daysAgo, 19, answers.length * 4),
      responses: answers.map((answer, index) =>
        buildResponse({ ...answer, createdAt: at(daysAgo, 19, index * 4) })
      ),
    }))
  )

  importExchangeSessions(
    EXCHANGES.map(({ daysAgo, peerId, minutes }) => {
      const peer = PEERS.find((candidate) => candidate.id === peerId)

      return {
        id: `demo-exchange-${daysAgo}-${peerId}`,
        demo: true,
        peer_id: peerId,
        peer_name: peer?.name ?? 'Practice partner',
        languages: [...(peer?.speaks ?? []), ...(peer?.learning ?? [])],
        mutual: true,
        seconds: minutes * 60,
        started_at: at(daysAgo, 17),
        ended_at: at(daysAgo, 17, minutes),
      }
    })
  )
}

export function clearDemoData() {
  removeDemoSessions()
  removeDemoExchangeSessions()
}
