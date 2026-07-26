import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const THEME_KEY = 'dungoo.theme'
const THEMES = ['light', 'dark', 'system']

const ThemeContext = createContext(null)

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return THEMES.includes(stored) ? stored : 'system'
  } catch {
    // Private-browsing modes can throw on localStorage access.
    return 'system'
  }
}

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function resolve(theme) {
  if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return theme
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme)
  const [resolvedTheme, setResolvedTheme] = useState(() => resolve(readStoredTheme()))

  // Paint the resolved theme onto <html> so every screen picks it up from the
  // token overrides in index.css.
  useEffect(() => {
    const root = document.documentElement
    const next = resolve(theme)

    setResolvedTheme(next)
    root.classList.toggle('dark', next === 'dark')
    // Keeps the mobile browser chrome in step with the app background.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', next === 'dark' ? '#070b14' : '#f4f7fb')

    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Preference simply will not persist; the session still works.
    }
  }, [theme])

  // Follow the OS while the preference is "system".
  useEffect(() => {
    if (theme !== 'system') return undefined

    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => {
      const next = systemPrefersDark() ? 'dark' : 'light'
      setResolvedTheme(next)
      document.documentElement.classList.toggle('dark', next === 'dark')
    }

    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [theme])

  // Enable colour transitions only after the first paint, otherwise the initial
  // render animates in from the wrong palette.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      document.documentElement.classList.add('theme-transition')
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const setTheme = useCallback((next) => {
    setThemeState(THEMES.includes(next) ? next : 'system')
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(resolve(theme) === 'dark' ? 'light' : 'dark')
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDark: resolvedTheme === 'dark',
      themes: THEMES,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
