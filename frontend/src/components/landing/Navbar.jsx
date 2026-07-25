import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { strings } from '../../i18n/en.js'
import Button from '../common/Button.jsx'
import ThemeToggle from '../common/ThemeToggle.jsx'

export default function Navbar() {
  const t = strings.landing.nav
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Lift the bar off the page once the hero starts scrolling away.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled
          ? 'border-primary/10 bg-panel/85 shadow-sm backdrop-blur'
          : 'border-transparent bg-panel/40 backdrop-blur'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue font-bold text-white shadow-md shadow-brand-blue/25">
            D
          </span>
          <span className="font-semibold text-primary">
            Dungoo <span className="text-link">SkillsHub</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {t.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-primary/70 transition-colors hover:text-link"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />

          <Link
            to="/login"
            className="hidden text-sm text-primary/70 transition-colors hover:text-link md:block"
          >
            {t.login}
          </Link>
          <Button as={Link} to="/signup" variant="accent" className="hidden md:inline-flex">
            {t.signup}
          </Button>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={t.toggle}
            aria-expanded={open}
            className="rounded-lg border border-primary/15 p-2 text-primary transition-colors hover:bg-surface md:hidden"
          >
            <span className="block h-0.5 w-5 bg-primary" />
            <span className="mt-1 block h-0.5 w-5 bg-primary" />
            <span className="mt-1 block h-0.5 w-5 bg-primary" />
          </button>
        </div>
      </nav>

      {open && (
        <ul className="space-y-1 border-t border-primary/10 bg-panel px-4 py-3 md:hidden">
          {t.links.map((link) => (
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
          <li>
            <Link to="/login" onClick={() => setOpen(false)} className="block py-2 text-primary/70">
              {t.login}
            </Link>
          </li>
          <li className="pt-2">
            <Button as={Link} to="/signup" variant="accent" className="w-full">
              {t.signup}
            </Button>
          </li>
        </ul>
      )}
    </header>
  )
}
