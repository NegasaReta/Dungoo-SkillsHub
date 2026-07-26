import { humanize } from '../../lib/labels.js'

export default function SelectField({
  id,
  label,
  options,
  error,
  placeholder = 'Select one…',
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-primary">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1.5 w-full rounded-lg border bg-panel px-3 py-2.5 text-primary outline-none transition-colors focus:ring-2 focus:ring-brand-blue/25 ${
          error ? 'border-danger/60' : 'border-primary/15 focus:border-brand-blue'
        }`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((value) => (
          <option key={value} value={value}>
            {humanize(value)}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
