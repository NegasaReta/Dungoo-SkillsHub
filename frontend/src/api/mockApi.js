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

function readUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
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

function currentUserIndex(users) {
  const token = getToken()
  if (!token?.startsWith(TOKEN_PREFIX)) return -1
  return users.findIndex((user) => user.id === token.slice(TOKEN_PREFIX.length))
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
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email: normalizedEmail,
    password,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    education_level: '',
    industries: [],
    phone_number: '',
    languages: [],
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
