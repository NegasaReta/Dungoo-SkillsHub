import { Link } from 'react-router-dom'

import { useMenu } from '../../hooks/useMenu.js'
import MenuPanel from '../app/MenuPanel.jsx'
import NavIcon from '../app/NavIcon.jsx'
import Panel from './Panel.jsx'

const AVATAR_TONES = ['bg-brand-blue text-white', 'bg-accent text-navy']

export default function SuggestionCard({ title, description, participants = [] }) {
  const { open, toggleMenu, closeMenu, containerProps } = useMenu()

  return (
    <Panel spotlight className="h-full">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-2.5 py-1 text-[11px] font-medium text-link">
          <NavIcon name="spark" className="h-3.5 w-3.5" />
          AI Suggestion
        </span>

        <div className="relative" {...containerProps}>
          <button
            type="button"
            onClick={toggleMenu}
            aria-label="Suggestion options"
            aria-haspopup="menu"
            aria-expanded={open}
            className="rounded-md p-1 text-primary/40 transition-colors hover:bg-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
          >
            <NavIcon name="dots" className="h-4 w-4" />
          </button>

          {open && (
            <MenuPanel className="w-48 p-1.5" role="menu">
              <Link
                to="/interview"
                role="menuitem"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2 text-xs text-primary/80 transition-colors hover:bg-surface hover:text-primary"
              >
                Start now
              </Link>
              <Link
                to="/analytics"
                role="menuitem"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2 text-xs text-primary/80 transition-colors hover:bg-surface hover:text-primary"
              >
                Why this suggestion?
              </Link>
            </MenuPanel>
          )}
        </div>
      </div>

      <h2 className="mt-3 text-base font-semibold text-primary">{title}</h2>
      <p className="mt-1.5 text-xs leading-relaxed text-primary/60">{description}</p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {participants.map((initials, index) => (
            <span
              key={initials}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ring-panel ${
                AVATAR_TONES[index % AVATAR_TONES.length]
              }`}
            >
              {initials}
            </span>
          ))}
        </div>

        <Link
          to="/interview"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-link transition-colors hover:text-primary"
        >
          Start Session
          <NavIcon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
    </Panel>
  )
}
