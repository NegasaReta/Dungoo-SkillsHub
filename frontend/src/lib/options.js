/**
 * The allowed values for the profile step. In demo mode the mock API serves
 * these from `/meta/options`; against the real backend they are only a fallback
 * for when the request fails, and the form shows a notice when that happens.
 */
export const DEFAULT_OPTIONS = {
  educationLevels: ['high_school', 'tvet', 'diploma', 'bachelor', 'master', 'phd', 'other'],
  industries: [
    'tech',
    'engineering',
    'health',
    'finance',
    'education',
    'agriculture',
    'manufacturing',
    'hospitality',
    'retail',
    'other',
  ],
  languages: ['amharic', 'english', 'afaan_oromo', 'tigrinya', 'somali', 'other'],
}

// The exact key names the backend will use are not settled yet, so accept the
// likely spellings instead of hard-failing on a naming mismatch.
const RESPONSE_KEYS = {
  educationLevels: ['education_levels', 'education_level', 'education', 'educationLevels'],
  industries: ['industries', 'industry'],
  languages: ['languages', 'language'],
}

function pickList(payload, candidates) {
  for (const key of candidates) {
    const value = payload?.[key]
    if (Array.isArray(value) && value.length) return value
  }
  return null
}

// Accepts either ['tech'] or [{ value: 'tech', label: 'Tech' }].
function toValues(list) {
  return list.map((item) => (typeof item === 'string' ? item : item?.value)).filter(Boolean)
}

export function normalizeOptions(payload) {
  const options = {}
  const missing = []

  for (const [field, candidates] of Object.entries(RESPONSE_KEYS)) {
    const values = toValues(pickList(payload, candidates) ?? [])
    if (values.length) {
      options[field] = values
    } else {
      options[field] = DEFAULT_OPTIONS[field]
      missing.push(field)
    }
  }

  return { options, missing }
}
