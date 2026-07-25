/**
 * Real interview endpoints. Reach these through api/index.js rather than importing
 * this file directly, so the mock/live switch keeps working.
 */
import client from './client.js'
import { asIntId } from '../lib/ids.js'

// Keep this local — importing from ./index.js would create a circular dependency.
const usingMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'

function requireLiveApi() {
  if (usingMockApi) {
    throw new Error(
      'AI Interview needs the live backend. Set VITE_USE_MOCK_API=false in frontend/.env.local, restart the dev server, and sign in again.'
    )
  }
}

export async function fetchRoles() {
  requireLiveApi()
  const { data } = await client.get('/interview/roles')
  return data
}

/** Creates a session for the signed-in user (JWT). Do not send user_id from the client. */
export async function createSession({ role }) {
  requireLiveApi()
  const { data } = await client.post('/interview/sessions', { role })
  return data
}

export async function fetchNextTurn(sessionId) {
  requireLiveApi()
  const id = asIntId(sessionId, 'Session id')
  const { data } = await client.post(`/interview/sessions/${id}/turns/next`)
  return data
}

/** Returns a blob URL for the spoken question. Caller must revoke it. */
export async function fetchTurnAudio(sessionId, turnIndex) {
  const id = asIntId(sessionId, 'Session id')
  const index = asIntId(turnIndex, 'Turn index', { allowZero: true })
  const { data } = await client.get(`/interview/sessions/${id}/turns/${index}/audio`, {
    responseType: 'blob',
  })
  return URL.createObjectURL(data)
}

export async function submitTurnAnswer(sessionId, turnIndex, audioBlob, language = 'en') {
  const id = asIntId(sessionId, 'Session id')
  const index = asIntId(turnIndex, 'Turn index', { allowZero: true })
  const form = new FormData()
  form.append('audio', audioBlob, 'answer.webm')
  if (language) form.append('language', language)

  const { data } = await client.post(`/interview/sessions/${id}/turns/${index}/answer`, form, {
    transformRequest: [
      (body, headers) => {
        // Drop the client's JSON default so the browser sets the multipart boundary.
        if (body instanceof FormData) delete headers['Content-Type']
        return body
      },
    ],
  })
  return data
}

/**
 * Ends the session, sending the one engagement summary the browser aggregated.
 * `engagement` is null whenever the camera was off or the device could not run
 * the model, and the server treats it as optional.
 */
export async function completeSession(sessionId, engagement = null) {
  const id = asIntId(sessionId, 'Session id')
  const { data } = await client.post(`/interview/sessions/${id}/complete`, { engagement })
  return data
}

/**
 * Session history for the signed-in user, feeding the Skill Passport (FR-6) and
 * progress dashboard (FR-7). Callers treat a failure here as "no history yet",
 * since this route is still pending on the backend.
 */
export async function fetchSessions() {
  const { data } = await client.get('/interview/sessions')
  return data
}
