/**
 * Dungoo brand palette. Single source of truth: tailwind.config.js reads these,
 * and chart libraries that need raw hex values import them directly.
 */
export const brandColors = {
  primary: '#0F172A',
  accent: '#F59E0B',
  brandBlue: '#1B4A8F',
  surface: '#F4F7FB',
}

/**
 * Surface palette for the signed-in app, derived from the same brand colours as
 * the marketing site so the two halves of the product look like one product.
 */
export const appColors = {
  base: brandColors.surface,
  panel: '#FFFFFF',
  panelMuted: brandColors.surface,
  border: '#E2E8F2',
  text: brandColors.primary,
  muted: '#64748B',
  blue: brandColors.brandBlue,
  teal: '#0F8A5F',
}
