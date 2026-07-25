import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { searchDestinations } from '../../data/navigation.js'
import { useMenu } from '../../hooks/useMenu.js'
import { strings } from '../../i18n/en.js'
import MenuPanel from './MenuPanel.jsx'
import NavIcon from './NavIcon.jsx'

// Mac keyboards use Command where the rest use Control, so the hint has to match
// the machine or it is just wrong information.
const SHORTCUT_HINT =
  typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.userAgent)
    ? '⌘ K'
    : 'Ctrl K'

export default function SearchBox({ className = '' }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const { open, openMenu, closeMenu, containerProps } = useMenu()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const listId = useId()

  const results = useMemo(() => searchDestinations(query), [query])
  const expanded = open && Boolean(query.trim())

  // A new query invalidates whatever was highlighted.
  useEffect(() => setActiveIndex(0), [query])

  /**
   * Ctrl+K, or ⌘K on a Mac, is the shortcut people already expect for this. The
   * topbar renders one search for wide screens and one for narrow, and only ever
   * shows a single one, so the hidden copy checks visibility before taking focus.
   */
  useEffect(() => {
    const handleShortcut = (event) => {
      if (event.key !== 'k' || !(event.metaKey || event.ctrlKey)) return
      const input = inputRef.current
      if (!input || input.offsetParent === null) return

      event.preventDefault()
      input.focus()
      input.select()
    }

    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [])

  function go(to) {
    setQuery('')
    closeMenu()
    inputRef.current?.blur()
    navigate(to)
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      // First press closes the list, a second one clears what was typed.
      if (expanded) closeMenu()
      else setQuery('')
      return
    }

    if (!results.length) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      openMenu()
      setActiveIndex((current) => (current + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      openMenu()
      setActiveIndex((current) => (current - 1 + results.length) % results.length)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const target = results[activeIndex] ?? results[0]
    if (target) go(target.to)
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`relative w-full sm:max-w-md ${className}`}
      {...containerProps}
    >
      <label htmlFor={`${listId}-input`} className="sr-only">
        {strings.topbar.searchLabel}
      </label>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-primary/40">
        <NavIcon name="search" className="h-4 w-4" />
      </span>
      <input
        ref={inputRef}
        id={`${listId}-input`}
        type="search"
        value={query}
        placeholder={strings.topbar.searchPlaceholder}
        role="combobox"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-activedescendant={
          expanded && results.length ? `${listId}-option-${activeIndex}` : undefined
        }
        aria-autocomplete="list"
        onChange={(event) => {
          setQuery(event.target.value)
          openMenu()
        }}
        onFocus={openMenu}
        onKeyDown={handleKeyDown}
        className="w-full rounded-full border border-primary/15 bg-surface py-2 pl-9 pr-16 text-sm text-primary outline-none transition-colors placeholder:text-primary/40 focus:border-brand-blue focus:bg-panel"
      />

      {/* Hidden once typing starts, where it would sit on top of the text. */}
      {!query && (
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3 my-auto hidden h-5 items-center rounded border border-primary/15 bg-panel px-1.5 font-sans text-[10px] font-medium text-primary/45 md:flex"
        >
          {SHORTCUT_HINT}
        </kbd>
      )}

      {expanded && (
        <MenuPanel className="left-0 w-full overflow-hidden">
          {results.length ? (
            <>
              <ul id={listId} role="listbox" aria-label={strings.topbar.searchResults} className="py-1">
                {results.map((item, index) => (
                  // presentation: a listbox must own its options directly.
                  <li key={item.to} role="presentation">
                    <button
                      type="button"
                      id={`${listId}-option-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      onClick={() => go(item.to)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        index === activeIndex
                          ? 'bg-surface text-primary'
                          : 'text-primary/80 hover:text-primary'
                      }`}
                    >
                      <NavIcon name={item.icon} className="h-4 w-4 text-primary/45" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="border-t border-primary/10 px-4 py-2 text-[11px] text-primary/45">
                {strings.topbar.searchHint}
              </p>
            </>
          ) : (
            <p className="px-4 py-3 text-sm text-primary/55">{strings.topbar.searchEmpty}</p>
          )}
        </MenuPanel>
      )}
    </form>
  )
}
