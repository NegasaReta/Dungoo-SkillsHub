export const MIN_PASSWORD_LENGTH = 8

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Shown live under the password field as a checklist, and reused as the
 * validation rule set, so the requirements and the check can never drift apart.
 */
export const PASSWORD_RULES = [
  {
    id: 'length',
    label: `At least ${MIN_PASSWORD_LENGTH} characters`,
    test: (value) => value.length >= MIN_PASSWORD_LENGTH,
  },
  { id: 'lowercase', label: 'A lowercase letter', test: (value) => /[a-z]/.test(value) },
  { id: 'uppercase', label: 'An uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { id: 'number', label: 'A number', test: (value) => /\d/.test(value) },
  { id: 'special', label: 'A special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
]

export function passwordRuleState(value) {
  return PASSWORD_RULES.map(({ id, label, test }) => ({ id, label, passed: test(value) }))
}

const STRENGTH_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']

export function passwordStrength(value) {
  const met = PASSWORD_RULES.filter((rule) => rule.test(value)).length
  return {
    met,
    total: PASSWORD_RULES.length,
    label: met ? STRENGTH_LABELS[met - 1] : STRENGTH_LABELS[0],
  }
}

export function validateRequired(value, label) {
  return value.trim() ? null : `${label} is required.`
}

export function validateEmail(value) {
  if (!value.trim()) return 'Email is required.'
  if (!EMAIL_PATTERN.test(value.trim())) return 'Enter a valid email address.'
  return null
}

export function validateEmailConfirmation(email, confirmation) {
  if (!confirmation.trim()) return 'Please confirm your email address.'
  if (confirmation.trim().toLowerCase() !== email.trim().toLowerCase()) {
    return 'Email addresses do not match.'
  }
  return null
}

export function validatePasswordStrength(value) {
  if (!value) return 'Password is required.'
  const unmet = PASSWORD_RULES.filter((rule) => !rule.test(value))
  if (!unmet.length) return null
  return `Password still needs: ${unmet.map((rule) => rule.label.toLowerCase()).join(', ')}.`
}

export function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation) return 'Please confirm your password.'
  if (confirmation !== password) return 'Passwords do not match.'
  return null
}

/**
 * Deliberately permissive: the server is the authority on phone format. This
 * only catches obvious typos before a round trip, accepting an optional country
 * code plus common separators (e.g. +251912345678, 0912 345 678).
 */
export function validatePhone(value) {
  if (!value.trim()) return 'Phone number is required.'
  const compact = value.replace(/[\s().-]/g, '')
  if (!/^\+?\d{7,15}$/.test(compact)) {
    return 'Enter a valid phone number, for example +251912345678.'
  }
  return null
}
