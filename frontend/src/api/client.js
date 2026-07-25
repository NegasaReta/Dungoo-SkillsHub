import axios from 'axios'

import { humanize } from '../lib/labels.js'
import { clearToken, getToken, SESSION_EXPIRED_EVENT } from '../lib/token.js'

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
 * Turn FastAPI / Pydantic validation messages into short UI copy so users never
 * see phrasing like "unable to parse string as an integer".
 */
function humanizeValidationMessage(field, msg) {
  const text = String(msg ?? '')
  const lower = text.toLowerCase()

  if (lower.includes('valid integer') || lower.includes('parse string as an integer')) {
    return `${humanize(field)} must be a whole number. Sign out and sign in again.`
  }
  if (lower.includes('not a valid email')) {
    return 'Enter a valid email address.'
  }
  if (lower.includes('field required') || lower.includes('missing')) {
    return `${humanize(field)} is required.`
  }

  return field && field !== 'body' ? `${humanize(field)}: ${text}` : text
}

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
        return humanizeValidationMessage(field, item.msg)
      })
      .filter(Boolean)
      .join('\n')
    if (message) return new Error(message)
  }

  if (error.response?.status === 422) {
    return new Error('Some fields look invalid. Check your input and try again.')
  }

  if (error.response) {
    return new Error(`Request failed with status ${error.response.status}.`)
  }

  return new Error('Cannot reach the server. Check that the backend is running.')
}

/**
 * A stored token the server refuses is a dead end: every later call fails the
 * same way. Drop it and let the app return to the signed-out UI instead of
 * showing the candidate "Could not validate credentials".
 */
function isStaleSession(error) {
  if (error.response?.status !== 401) return false
  // A 401 while signing in means wrong credentials, not an expired session.
  const url = error.config?.url ?? ''
  return !url.startsWith('/auth/login') && !url.startsWith('/auth/signup')
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isStaleSession(error)) {
      clearToken()
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
      return Promise.reject(new Error('Your session has expired. Please sign in again.'))
    }
    return Promise.reject(toReadableError(error))
  }
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
