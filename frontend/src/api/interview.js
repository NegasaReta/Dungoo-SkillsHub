/**
 * Real interview endpoints. Reach these through api/index.js rather than importing
 * this file directly, so the mock/live switch keeps working.
 */
import client from './client.js'

export async function fetchQuestions(role) {
  const { data } = await client.get('/interview/questions', { params: { role } })
  return data
}

export async function createSession({ userId, role }) {
  const { data } = await client.post('/interview/sessions', { user_id: userId, role })
  return data
}

export async function submitResponse(sessionId, { questionId, transcript }) {
  const { data } = await client.post(`/interview/sessions/${sessionId}/responses`, {
    question_id: questionId,
    transcript,
  })
  return data
}

export async function completeSession(sessionId) {
  const { data } = await client.post(`/interview/sessions/${sessionId}/complete`)
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
