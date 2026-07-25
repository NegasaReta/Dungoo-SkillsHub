import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { searchDestinations } from '../../data/navigation.js'
import { useMenu } from '../../hooks/useMenu.js'
import { strings } from '../../i18n/en.js'
import MenuPanel from './MenuPanel.jsx'
import NavIcon from './NavIcon.jsx'

export default function SearchBox() {
  const [query, setQuery] = useState('')
  const { open, openMenu, closeMenu, containerProps } = useMenu()
  const navigate = useNavigate()

  const results = useMemo(() => searchDestinations(query), [query])

  function go(to) {
    setQuery('')
    closeMenu()
    navigate(to)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (results.length) go(results[0].to)
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="relative max-w-md flex-1"
      {...containerProps}
    >
      <label htmlFor="app-search" className="sr-only">
        {strings.topbar.searchLabel}
      </label>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-primary/40">
        <NavIcon name="search" className="h-4 w-4" />
      </span>
      <input
        id="app-search"
        type="search"
        value={query}
        placeholder={strings.topbar.searchPlaceholder}
        onChange={(event) => {
          setQuery(event.target.value)
          openMenu()
        }}
        onFocus={openMenu}
        className="w-full rounded-full border border-primary/15 bg-surface py-2 pl-9 pr-4 text-sm text-primary outline-none transition-colors placeholder:text-primary/40 focus:border-brand-blue focus:bg-panel"
      />

      {open && query.trim() && (
        <MenuPanel className="left-0 w-full overflow-hidden">
          {results.length ? (
            <ul className="py-1">
              {results.map((item) => (
                <li key={item.to}>
                  <button
                    type="button"
                    onClick={() => go(item.to)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-primary/80 transition-colors hover:bg-surface hover:text-primary"
                  >
                    <NavIcon name={item.icon} className="h-4 w-4 text-primary/45" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-primary/55">{strings.topbar.searchEmpty}</p>
          )}
        </MenuPanel>
      )}
    </form>
  )
}
