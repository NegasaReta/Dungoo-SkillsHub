import NavIcon from '../app/NavIcon.jsx'

const MODES = [
  { id: 'text', label: 'Text', icon: 'message' },
  { id: 'voice', label: 'Voice', icon: 'mic' },
]

export default function ModeToggle({ mode, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Practice mode"
      className="flex items-center gap-1 rounded-lg border border-primary/15 bg-panel p-1"
    >
      {MODES.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={mode === item.id}
          onClick={() => onChange(item.id)}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
            mode === item.id ? 'bg-brand-blue text-white' : 'text-primary/60 hover:text-primary'
          }`}
        >
          <NavIcon name={item.icon} className="h-4 w-4" />
          {item.label}
        </button>
      ))}
    </div>
  )
}
