const MODES = [
  { id: 'text', label: 'Text' },
  { id: 'voice', label: 'Voice' },
]

export default function ModeToggle({ mode, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Practice mode"
      className="inline-flex rounded-lg border border-slate-200 bg-white p-1"
    >
      {MODES.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={mode === item.id}
          onClick={() => onChange(item.id)}
          className={`rounded-md px-4 py-1.5 text-sm ${
            mode === item.id ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
