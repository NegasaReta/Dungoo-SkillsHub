/**
 * Chart-friendly handles for the Dungoo brand palette.
 *
 * The values themselves live in the `@theme` block in index.css, which Tailwind v4
 * compiles into these CSS variables. Referencing them keeps charts and utility
 * classes from drifting apart.
 */
export const brandColors = {
  primary: 'var(--color-primary)',
  accent: 'var(--color-accent)',
  brandBlue: 'var(--color-brand-blue)',
  surface: 'var(--color-surface)',
  panel: 'var(--color-panel)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  track: 'var(--color-track)',
}
