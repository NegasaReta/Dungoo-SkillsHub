/**
 * Coerce API identifiers to integers so string IDs from localStorage/JSON never
 * reach FastAPI endpoints that expect int.
 */
export function asIntId(value, label = 'id', { allowZero = false } = {}) {
  const minimum = allowZero ? 0 : 1

  if (typeof value === 'number' && Number.isInteger(value) && value >= minimum) {
    return value
  }

  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const parsed = Number(value.trim())
    if (parsed >= minimum) return parsed
  }

  throw new Error(`${label} is missing or invalid. Sign out and sign in again.`)
}
