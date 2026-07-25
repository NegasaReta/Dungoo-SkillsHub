import client from './client.js'

export async function sendPracticeMessage({ message, history = [] }) {
  const { data } = await client.post('/practice/text', {
    message,
    conversation_history: history,
  })
  return data
}
