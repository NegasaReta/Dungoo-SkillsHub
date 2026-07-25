import { useState } from 'react'
import { Link } from 'react-router-dom'

import Button from '../common/Button.jsx'

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#passport', label: 'Skill Passport' },
  { href: '#why', label: 'Why Dungoo' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue font-bold text-white">
            D
          </span>
          <span className="font-semibold text-primary">
            Dungoo <span className="text-brand-blue">SkillsHub</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-sm text-primary/70 hover:text-brand-blue">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <Button as={Link} to="/onboarding" variant="accent">
            Start practicing
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          className="rounded-lg border border-primary/15 p-2 text-primary md:hidden"
        >
          <span className="block h-0.5 w-5 bg-primary" />
          <span className="mt-1 block h-0.5 w-5 bg-primary" />
          <span className="mt-1 block h-0.5 w-5 bg-primary" />
        </button>
      </nav>

      {open && (
        <ul className="space-y-1 border-t border-primary/10 bg-white px-4 py-3 md:hidden">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-2 text-primary/70"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <Button as={Link} to="/onboarding" variant="accent" className="w-full">
              Start practicing
            </Button>
          </li>
        </ul>
      )}
    </header>
  )
}
