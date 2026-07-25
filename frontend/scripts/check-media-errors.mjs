/**
 * Every getUserMedia failure must reach a message that names where the fix is.
 *
 * The case that prompted this: Chrome reports a Windows-level camera block as
 * "Permission denied by system", which the interface used to relay as a bare
 * error, and before that as advice to check browser permissions the candidate
 * had already granted.
 *
 *     node scripts/check-media-errors.mjs
 */

import { readFileSync } from 'node:fs'

import { MEDIA_FAULTS, classifyMediaError } from '../src/lib/mediaErrors.js'

const CASES = [
  ['Chrome, Windows camera privacy off', 'NotAllowedError', 'Permission denied by system', 'systemBlocked'],
  ['Chrome, site permission blocked', 'NotAllowedError', 'Permission denied', 'siteBlocked'],
  ['User dismissed the prompt', 'NotAllowedError', 'Permission dismissed', 'siteBlocked'],
  ['Legacy permission error', 'PermissionDeniedError', '', 'siteBlocked'],
  ['No webcam attached', 'NotFoundError', 'Requested device not found', 'notFound'],
  ['Device held by another app', 'NotReadableError', 'Could not start video source', 'inUse'],
  ['Insecure origin', 'SecurityError', '', 'insecure'],
  ['Unrecognised failure', 'AbortError', 'Starting videoinput failed', 'unknown'],
]

let failures = 0

for (const [label, name, message, expected] of CASES) {
  const error = Object.assign(new Error(message), { name })
  const actual = classifyMediaError(error)
  const ok = actual === expected

  if (!ok) failures += 1
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${label} -> ${actual}${ok ? '' : ` (expected ${expected})`}`)
}

// A fault with no copy behind it renders as blank space, which is worse than the
// raw browser message it replaced.
const strings = readFileSync(new URL('../src/i18n/en.js', import.meta.url), 'utf8')

for (const set of ['micFaults', 'cameraFaults']) {
  const block = strings.split(`${set}: {`)[1]?.split('},')[0] ?? ''
  const missing = Object.values(MEDIA_FAULTS).filter((fault) => !block.includes(`${fault}:`))

  if (missing.length) failures += 1
  console.log(
    `  [${missing.length ? 'FAIL' : 'PASS'}] ${set} covers every fault` +
      (missing.length ? ` — missing ${missing.join(', ')}` : '')
  )
}

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll checks passed.')
process.exit(failures ? 1 : 0)
