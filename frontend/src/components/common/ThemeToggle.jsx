import NavIcon from '../app/NavIcon.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { strings } from '../../i18n/en.js'

/** One-tap light/dark switch. The three-way preference lives in Settings. */
export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()
  const label = isDark ? strings.theme.switchToLight : strings.theme.switchToDark

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      aria-pressed={isDark}
      className={`rounded-lg border border-primary/15 p-2 text-primary/70 transition-colors hover:border-brand-blue/40 hover:text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${className}`}
    >
      <NavIcon name={isDark ? 'sun' : 'moon'} />
    </button>
  )
}
