/**
 * Single entry point for API calls. The frontend runs against the localStorage
 * mock until the backend exists; set VITE_USE_MOCK_API=false to switch every
 * call over to the real FastAPI client without touching any component.
 */
import * as mockApi from './mockApi.js'
import * as httpApi from './client.js'
import * as mockInterview from './mockInterview.js'
import * as httpInterview from './interview.js'
import * as mockMatching from './mockMatching.js'
import * as httpMatching from './matching.js'

export const usingMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'

const api = usingMockApi ? mockApi : httpApi
const interview = usingMockApi ? mockInterview : httpInterview
const matching = usingMockApi ? mockMatching : httpMatching

export const {
  signup,
  login,
  fetchMe,
  completeProfile,
  fetchOptions,
  requestPasswordReset,
  resetPassword,
} = api

// Interview screens that import these from here work with or without a backend.
// Importing './interview.js' directly bypasses the mock, which also means the
// session never reaches the Skill Passport or dashboard while running on mocks.
export const { fetchQuestions, createSession, submitResponse, completeSession, fetchSessions } =
  interview

// Peer exchange. The live versions time sessions on the server; the mock keeps
// the same shape in localStorage so the page works without a backend.
export const {
  fetchMatchingOptions,
  fetchPeers,
  fetchAllowance,
  fetchExchangeState,
  startExchangeSession,
  pauseExchangeSession,
  resumeExchangeSession,
  endExchangeSession,
  fetchExchangeSessions,
} = matching

export { clearToken, getToken, setToken } from '../lib/token.js'
