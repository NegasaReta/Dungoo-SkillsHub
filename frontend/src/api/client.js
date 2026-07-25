import axios from 'axios'

import { humanize } from '../lib/labels.js'
import { getToken } from '../lib/token.js'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/**
 * FastAPI reports errors as `detail`, which is a plain string for HTTPException
 * but a list of `{ loc, msg }` objects for 422 validation failures. Both are
 * flattened here so callers only ever handle `error.message`.
 */
function toReadableError(error) {
  const detail = error.response?.data?.detail

  if (typeof detail === 'string' && detail.trim()) {
    return new Error(detail)
  }

  if (Array.isArray(detail)) {
    const message = detail
      .map((item) => {
        if (!item?.msg) return null
        const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : null
        return field && field !== 'body' ? `${humanize(field)}: ${item.msg}` : item.msg
      })
      .filter(Boolean)
      .join('\n')
    if (message) return new Error(message)
  }

  if (error.response) {
    return new Error(`Request failed with status ${error.response.status}.`)
  }

  return new Error('Cannot reach the server. Check that the backend is running.')
}

client.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toReadableError(error))
)

export async function signup(details) {
  const { data } = await client.post('/auth/signup', details)
  return data
}

export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password })
  return data
}

export async function fetchMe() {
  const { data } = await client.get('/auth/me')
  return data
}

export async function completeProfile(profile) {
  const { data } = await client.post('/profile/complete', profile)
  return data
}

export async function fetchOptions() {
  const { data } = await client.get('/meta/options')
  return data
}

export async function requestPasswordReset(email) {
  const { data } = await client.post('/auth/forgot-password', { email })
  return data
}

export async function resetPassword(token, newPassword) {
  const { data } = await client.post('/auth/reset-password', {
    token,
    new_password: newPassword,
  })
  return data
}

export default client
