/**
 * Dates are formatted through Intl rather than written out here, so switching the
 * UI to Amharic, Afaan Oromoo, or Tigrinya later changes the locale, not the code.
 */
const SHORT_DATE = { day: 'numeric', month: 'short', year: 'numeric' }

export function formatDate(value, locale) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(locale, SHORT_DATE).format(date)
}
