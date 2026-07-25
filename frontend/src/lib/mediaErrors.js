/**
 * What a getUserMedia rejection actually means, and where the fix lives.
 *
 * The browser's own wording is misleading in the case that matters most on
 * Windows. "Permission denied by system" is not the site permission the
 * candidate just granted — it is the OS privacy setting one level above the
 * browser. Telling them to check their browser permissions sends them to a
 * screen where everything already looks correct.
 */

export const MEDIA_FAULTS = {
  /** The operating system blocks the browser from the device at all. */
  systemBlocked: 'systemBlocked',
  /** The site permission was dismissed or blocked in this browser. */
  siteBlocked: 'siteBlocked',
  /** No such device is attached. */
  notFound: 'notFound',
  /** Another application holds the device. */
  inUse: 'inUse',
  /** Browsers only hand out media over https or localhost. */
  insecure: 'insecure',
  unknown: 'unknown',
}

// Chrome and Edge say "Permission denied by system"; Firefox and Safari word the
// OS-level refusal differently, so the check is on the shape rather than the phrase.
const SYSTEM_BLOCK = /system|operating system|os\b/i

export function classifyMediaError(error) {
  const name = error?.name ?? ''
  const message = error?.message ?? ''

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return SYSTEM_BLOCK.test(message) ? MEDIA_FAULTS.systemBlocked : MEDIA_FAULTS.siteBlocked
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return MEDIA_FAULTS.notFound
  if (name === 'NotReadableError' || name === 'TrackStartError') return MEDIA_FAULTS.inUse
  if (name === 'SecurityError') return MEDIA_FAULTS.insecure
  // An insecure origin has no mediaDevices at all, which surfaces as a TypeError
  // rather than a DOMException.
  if (name === 'TypeError' && typeof window !== 'undefined' && !window.isSecureContext) {
    return MEDIA_FAULTS.insecure
  }

  return MEDIA_FAULTS.unknown
}
