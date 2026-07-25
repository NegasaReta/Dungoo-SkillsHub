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
      className={`sticky top-0 z-50 bg-gradient-to-r from-brand-blue/10 via-transparent to-accent/10 backdrop-blur transition-colors ${
        scrolled ? 'bg-panel/85 shadow-sm' : 'bg-panel/40'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3">
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
                className="group relative text-sm text-primary/70 transition-colors hover:text-link"
              >
                {link.label}
                {/* Gold underline grows in from the left on hover. */}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-accent transition-all duration-300 group-hover:w-full"
                />
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
            className="rounded-lg border border-brand-blue/25 p-2 text-link transition-colors hover:bg-brand-blue/10 md:hidden"
          >
            <span className="block h-0.5 w-5 bg-brand-blue" />
            <span className="mt-1 block h-0.5 w-5 bg-accent" />
            <span className="mt-1 block h-0.5 w-5 bg-brand-blue" />
          </button>
        </div>
      </nav>

      {/* Brand hairline that fades in once the bar detaches from the hero. */}
      <div
        aria-hidden="true"
        className={`h-px bg-gradient-to-r from-brand-blue via-accent to-brand-blue transition-opacity duration-300 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {open && (
        <ul className="space-y-1 bg-panel px-4 py-3 md:hidden">
          {t.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-2 py-2 text-primary/70 transition-colors hover:bg-brand-blue/10 hover:text-link"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-2 text-primary/70 transition-colors hover:bg-brand-blue/10 hover:text-link"
            >
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
