/** Rubric ceiling. The backend scores clarity, confidence, and STAR from 1 to 5. */
export const SCORE_MAX = 5

/** Fallback roles if GET /interview/roles is unavailable; the bank itself lives in
 * backend/app/data/questions.json. */
export const ROLES = [
  { slug: 'software-engineer', label: 'Software Engineer' },
  { slug: 'data-analyst', label: 'Data Analyst' },
  { slug: 'customer-support', label: 'Customer Support' },
]
