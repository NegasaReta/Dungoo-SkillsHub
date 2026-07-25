/**
 * Browser-only stand-in for the FastAPI backend, so the frontend can be built
 * and demoed before the API exists. It mirrors the real endpoint contract:
 * same request payloads, same response shapes, same error rules.
 *
 * Not security: accounts live in localStorage and passwords are stored in the
 * clear. This module is never reachable once VITE_USE_MOCK_API=false.
 */
import { DEFAULT_OPTIONS } from '../lib/options.js'
import { getToken } from '../lib/token.js'
import { validatePasswordStrength } from '../lib/validation.js'

const USERS_KEY = 'dungoo.mock.users'
const TOKEN_PREFIX = 'mock.'
const LATENCY_MS = 250

// Keeps loading and disabled states honest during development.
const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

function nextUserId(users) {
  const max = users.reduce((highest, user) => {
    const id = Number(user.id)
    return Number.isInteger(id) && id > highest ? id : highest
  }, 0)
  return max + 1
}

/** Older mock users used string ids; rewrite them so /auth/me matches the API. */
function normalizeUser(user, fallbackId) {
  const numericId = Number(user.id)
  const id = Number.isInteger(numericId) && numericId > 0 ? numericId : fallbackId
  return { ...user, id }
}

function readUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []

    let changed = false
    const users = parsed.map((user, index) => {
      const normalized = normalizeUser(user, index + 1)
      if (normalized.id !== user.id) changed = true
      return normalized
    })

    if (changed) writeUsers(users)
    return users
  } catch {
    return []
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function publicUser(user) {
  const result = { ...user }
  delete result.password
  return result
}

const tokenFor = (user) => `${TOKEN_PREFIX}${user.id}`

/** Id of the signed-in mock user, or null. Shared with the mock interview store. */
export function currentUserId() {
  const token = getToken()
  if (!token?.startsWith(TOKEN_PREFIX)) return null
  const id = Number(token.slice(TOKEN_PREFIX.length))
  return Number.isInteger(id) ? id : null
}

function currentUserIndex(users) {
  const id = currentUserId()
  return id === null ? -1 : users.findIndex((user) => user.id === id)
}

function session(user) {
  return {
    access_token: tokenFor(user),
    token_type: 'bearer',
    profile_completed: user.profile_completed,
  }
}

export async function signup({ first_name, last_name, email, password }) {
  await delay()

  const normalizedEmail = email.trim().toLowerCase()

  const strengthError = validatePasswordStrength(password)
  if (strengthError) throw new Error(strengthError)
  if (!first_name?.trim()) throw new Error('First name is required.')
  if (!last_name?.trim()) throw new Error('Last name is required.')

  const users = readUsers()
  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('Email already registered.')
  }

  const user = {
    id: nextUserId(users),
    email: normalizedEmail,
    password,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    education_level: '',
    industries: [],
    phone_number: '',
    languages: [],
    practising_languages: [],
    profile_completed: false,
    created_at: new Date().toISOString(),
  }

  writeUsers([...users, user])
  return session(user)
}

export async function login(email, password) {
  await delay()

  const normalizedEmail = email.trim().toLowerCase()
  const user = readUsers().find((candidate) => candidate.email === normalizedEmail)

  // One message for both cases, so the mock does not leak which emails exist.
  if (!user || user.password !== password) {
    throw new Error('Incorrect email or password.')
  }

  return session(user)
}

export async function fetchMe() {
  await delay()

  const users = readUsers()
  const index = currentUserIndex(users)
  if (index === -1) throw new Error('Could not validate credentials.')

  return publicUser(users[index])
}

function validateProfile(profile) {
  const errors = []

  // Names are optional here: onboarding already captured them at signup, and
  // settings sends them back when they are edited.
  for (const field of ['first_name', 'last_name']) {
    if (field in profile && !profile[field]?.trim()) {
      errors.push(`${field === 'first_name' ? 'First' : 'Last'} name is required.`)
    }
  }

  if (!DEFAULT_OPTIONS.educationLevels.includes(profile.education_level)) {
    errors.push(`Education level: unknown value '${profile.education_level}'.`)
  }

  if (!profile.phone_number?.trim()) {
    errors.push('Phone number is required.')
  }

  for (const [field, allowed] of [
    ['industries', DEFAULT_OPTIONS.industries],
    ['languages', DEFAULT_OPTIONS.languages],
  ]) {
    const selected = profile[field] ?? []
    if (!selected.length) {
      errors.push(`Select at least one ${field === 'industries' ? 'industry' : 'language'}.`)
      continue
    }
    const unknown = selected.filter((value) => !allowed.includes(value))
    if (unknown.length) {
      errors.push(`${field}: unknown value(s) ${unknown.join(', ')}.`)
    }
  }

  // Optional, like the server's field: only the values are checked.
  const unknownPractising = (profile.practising_languages ?? []).filter(
    (value) => !DEFAULT_OPTIONS.languages.includes(value)
  )
  if (unknownPractising.length) {
    errors.push(`practising_languages: unknown value(s) ${unknownPractising.join(', ')}.`)
  }

  return errors
}

export async function completeProfile(profile) {
  await delay()

  const users = readUsers()
  const index = currentUserIndex(users)
  if (index === -1) throw new Error('Could not validate credentials.')

  const errors = validateProfile(profile)
  if (errors.length) throw new Error(errors.join('\n'))

  const updated = {
    ...users[index],
    education_level: profile.education_level,
    industries: profile.industries,
    phone_number: profile.phone_number.trim(),
    languages: profile.languages,
    practising_languages: profile.practising_languages ?? [],
    profile_completed: true,
  }

  if ('first_name' in profile) updated.first_name = profile.first_name.trim()
  if ('last_name' in profile) updated.last_name = profile.last_name.trim()

  users[index] = updated
  writeUsers(users)
  return publicUser(updated)
}

export async function fetchOptions() {
  await delay()

  return {
    education_levels: DEFAULT_OPTIONS.educationLevels,
    industries: DEFAULT_OPTIONS.industries,
    languages: DEFAULT_OPTIONS.languages,
  }
}

/** Mirrors the server's rules: prove the current password, and pick a new one. */
export async function changePassword(currentPassword, newPassword) {
  await delay()

  const users = readUsers()
  const index = currentUserIndex(users)
  if (index === -1) throw new Error('Could not validate credentials.')

  if (users[index].password !== currentPassword) {
    throw new Error('Your current password is not correct.')
  }
  if (currentPassword === newPassword) {
    throw new Error('Your new password must be different from your current one.')
  }

  const strengthError = validatePasswordStrength(newPassword)
  if (strengthError) throw new Error(strengthError)

  users[index] = { ...users[index], password: newPassword }
  writeUsers(users)

  return { message: 'Your password has been changed.' }
}

const RESETS_KEY = 'dungoo.mock.resets'

function readResets() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RESETS_KEY) ?? '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * Mirrors the real endpoint: the same answer for unknown emails, so the reply
 * never reveals who has an account. The token is handed back directly because
 * there is no inbox to send it to.
 */
export async function requestPasswordReset(email) {
  await delay()

  const normalizedEmail = email.trim().toLowerCase()
  const message = 'If that email is registered, a password reset link is on its way.'
  const user = readUsers().find((candidate) => candidate.email === normalizedEmail)
  if (!user) return { message }

  const token = `mock-reset-${Date.now().toString(36)}`
  localStorage.setItem(RESETS_KEY, JSON.stringify({ ...readResets(), [token]: user.id }))

  return {
    message,
    reset_token: token,
    reset_url: `${window.location.origin}/reset-password?token=${token}`,
  }
}

export async function resetPassword(token, newPassword) {
  await delay()

  const resets = readResets()
  const userId = resets[token]
  const users = readUsers()
  const index = users.findIndex((candidate) => candidate.id === userId)
  if (index === -1) {
    throw new Error('This reset link is invalid or has expired. Request a new one.')
  }

  const strengthError = validatePasswordStrength(newPassword)
  if (strengthError) throw new Error(strengthError)

  users[index] = { ...users[index], password: newPassword }
  writeUsers(users)

  // Single use, exactly like the server's token.
  delete resets[token]
  localStorage.setItem(RESETS_KEY, JSON.stringify(resets))

  return { message: 'Your password has been reset. You can log in now.' }
}
