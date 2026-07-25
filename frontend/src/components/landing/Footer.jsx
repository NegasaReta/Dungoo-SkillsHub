import { Link } from 'react-router-dom'

import { format, strings } from '../../i18n/en.js'

export default function Footer() {
  const t = strings.landing.footer

  return (
    // `navy` stays dark in both themes, so the ink here is white rather than
    // `text-primary` (which inverts).
    <footer className="bg-navy text-white">
      <div aria-hidden="true" className="h-1 bg-gradient-to-r from-brand-blue via-accent to-brand-blue" />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-bold text-navy">
                D
              </span>
              <span className="font-semibold text-white">
                Dungoo <span className="text-accent">SkillsHub</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/70">{t.tagline}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-accent">{t.languagesTitle}</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {t.languages.map((language) => (
                <li key={language} className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent/70" />
                  {language}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-accent">{t.platformTitle}</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {strings.landing.nav.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors hover:text-accent">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/signup" className="transition-colors hover:text-accent">
                  {strings.landing.nav.signup}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-white/15 pt-6 text-sm text-white/60">
          {format(t.rights, { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  )
}
