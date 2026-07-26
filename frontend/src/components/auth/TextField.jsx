import { useState } from 'react'

export default function TextField({
  id,
  label,
  error,
  hint,
  className = '',
  type = 'text',
  ...props
}) {
  const [revealed, setRevealed] = useState(false)

  const isPassword = type === 'password'
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-primary">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={isPassword && revealed ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`mt-1.5 w-full rounded-lg border bg-panel px-3 py-2.5 text-primary outline-none transition-colors placeholder:text-primary/35 focus:ring-2 focus:ring-brand-blue/25 disabled:bg-surface disabled:text-primary/50 ${
            isPassword ? 'pr-16' : ''
          } ${error ? 'border-danger/60' : 'border-primary/15 focus:border-brand-blue'}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 mt-1.5 flex items-center rounded-r-lg px-3 text-xs font-medium text-primary/60 transition-colors hover:text-link"
          >
            {revealed ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-primary/50">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
