import { humanize } from '../../lib/labels.js'

export default function CheckboxGrid({ legend, hint, options, selected, onToggle, error }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-primary">{legend}</legend>
      {hint && <p className="mt-1 text-xs text-primary/50">{hint}</p>}

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((value) => {
          const checked = selected.includes(value)
          return (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                checked
                  ? 'border-brand-blue bg-brand-blue/10 text-primary'
                  : 'border-primary/15 text-primary/70 hover:border-primary/30'
              }`}
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand-blue"
                checked={checked}
                onChange={() => onToggle(value)}
              />
              {humanize(value)}
            </label>
          )
        })}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </fieldset>
  )
}
