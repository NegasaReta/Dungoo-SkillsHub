/**
 * The rubric runs 1-5, and the API sends 0 for an axis nothing has scored yet.
 * Zero therefore has to read as "no data", never as a failing mark.
 */
import { SCORE_MAX } from '../constants.js'

export const UNSCORED = 0

export const isScored = (value) => Number(value) > UNSCORED

/** One decimal, or a dash when the axis has no score behind it. */
export function formatScore(value) {
  return isScored(value) ? Number(value).toFixed(1) : '—'
}

export function scorePercent(value) {
  return isScored(value) ? (Number(value) / SCORE_MAX) * 100 : 0
}
