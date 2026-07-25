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
