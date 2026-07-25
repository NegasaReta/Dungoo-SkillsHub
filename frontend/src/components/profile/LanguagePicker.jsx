import { useId, useMemo, useState } from 'react'

import { groupLanguages, languageFullLabel, searchLanguages } from '../../data/languages.js'
import NavIcon from '../app/NavIcon.jsx'

/**
 * Searchable multi-select for languages. There are twenty-one to choose from, which
 * is too many to scan as a flat grid, so this searches across English name, native
 * name, and common alternative spellings, and keeps what is selected visible as
 * removable chips even when the search hides it.
 */
export default function LanguagePicker({
  legend,
  hint,
  options,
  selected,
  onToggle,
  error,
  searchPlaceholder = 'Search languages…',
}) {
  const [query, setQuery] = useState('')
  const inputId = useId()
  const errorId = `${inputId}-error`

  const sections = useMemo(() => groupLanguages(searchLanguages(options, query)), [options, query])
  const matchCount = sections.reduce((total, section) => total + section.entries.length, 0)

  return (
    <fieldset>
      <legend className="text-sm font-medium text-primary">{legend}</legend>
      {hint && <p className="mt-1 text-xs text-primary/50">{hint}</p>}

      {selected.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {selected.map((value) => (
            <li key={value}>
              <button
                type="button"
                onClick={() => onToggle(value)}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/15 py-1 pl-3 pr-2 text-xs font-medium text-primary ring-1 ring-brand-blue/30 transition-colors hover:bg-brand-blue/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              >
                {languageFullLabel(value)}
                <NavIcon name="close" className="h-3.5 w-3.5" />
                <span className="sr-only">Remove {languageFullLabel(value)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative mt-3">
        <NavIcon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40"
        />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          aria-describedby={error ? errorId : undefined}
          className="w-full rounded-lg border border-primary/15 bg-surface py-2 pl-9 pr-3 text-sm text-primary placeholder:text-primary/40 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
        />
      </div>

      {matchCount === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-primary/20 px-3 py-4 text-center text-sm text-primary/55">
          No language matches “{query}”. Pick “Another language” if yours is not listed yet.
        </p>
      ) : (
        <div className="mt-3 max-h-72 space-y-4 overflow-y-auto pr-1">
          {sections.map((section) => (
            <div key={section.group}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/45">
                {section.title}
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {section.entries.map((entry) => {
                  const checked = selected.includes(entry.value)
                  return (
                    <label
                      key={entry.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        checked
                          ? 'border-brand-blue bg-brand-blue/15 text-primary'
                          : 'border-primary/15 text-primary/70 hover:border-primary/30 hover:bg-surface'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0 accent-brand-blue"
                        checked={checked}
                        onChange={() => onToggle(entry.value)}
                      />
                      <span className="min-w-0">
                        <span className="block truncate">{entry.label}</span>
                        {entry.native && entry.native !== entry.label && (
                          <span className="block truncate text-xs text-primary/45">
                            {entry.native}
                          </span>
                        )}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </fieldset>
  )
}
