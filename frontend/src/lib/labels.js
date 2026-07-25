/**
 * The API speaks in snake_case enum values. Labels are derived here rather than
 * shipped by the server, so the allowed values stay a server-owned contract
 * while presentation stays a frontend concern.
 */
const LABEL_OVERRIDES = {
  tvet: 'TVET',
  phd: 'PhD',
  afaan_oromo: 'Afaan Oromo',
}

export function humanize(value) {
  if (typeof value !== 'string' || !value) return ''
  if (LABEL_OVERRIDES[value]) return LABEL_OVERRIDES[value]
  const spaced = value.replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
