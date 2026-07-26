import NavIcon from '../app/NavIcon.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { strings } from '../../i18n/en.js'

const OPTIONS = [
  { value: 'light', icon: 'sun' },
  { value: 'dark', icon: 'moon' },
  { value: 'system', icon: 'monitor' },
]

/** Three-way appearance preference: light, dark, or follow the device. */
export default function ThemeChoice() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label={strings.theme.legend}
      className="inline-flex rounded-xl border border-primary/15 bg-surface p-1"
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(option.value)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
              active
                ? 'bg-panel text-primary shadow-sm'
                : 'text-primary/60 hover:text-primary'
            }`}
          >
            <NavIcon name={option.icon} className="h-4 w-4" />
            {strings.theme[option.value]}
          </button>
        )
      })}
    </div>
  )
}
