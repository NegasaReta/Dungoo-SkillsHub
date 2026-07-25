import { useEffect, useState } from 'react'

/**
 * Resolved brand colours for canvas and WebGL work, which cannot use CSS
 * variables. Reads the raw `--dg-*` tokens rather than the `--color-*` aliases,
 * because the aliases resolve to `color-mix()` expressions that three.js cannot
 * parse. Re-reads when the theme class on <html> changes so the scene follows
 * light and dark mode.
 */
const TOKENS = ['primary', 'accent', 'brand-blue', 'link', 'navy', 'canvas', 'panel', 'surface']

const FALLBACK = {
  primary: '#0f172a',
  accent: '#f59e0b',
  'brand-blue': '#1b4a8f',
  link: '#1b4a8f',
  navy: '#0f172a',
  canvas: '#f4f7fb',
  panel: '#ffffff',
  surface: '#f4f7fb',
}

function readTokens() {
  if (typeof window === 'undefined') return FALLBACK

  const styles = getComputedStyle(document.documentElement)
  const entries = TOKENS.map((token) => {
    const value = styles.getPropertyValue(`--dg-${token}`).trim()
    return [token, value || FALLBACK[token]]
  })
  return Object.fromEntries(entries)
}

export function useThemeColors() {
  const [colors, setColors] = useState(readTokens)

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readTokens()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return colors
}

export default useThemeColors
