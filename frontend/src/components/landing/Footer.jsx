import { Link } from 'react-router-dom'

import { format, strings } from '../../i18n/en.js'

export default function Footer() {
  const t = strings.landing.footer

  return (
    <footer className="border-t border-primary/10 bg-panel">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue font-bold text-white">
                D
              </span>
              <span className="font-semibold text-primary">
                Dungoo <span className="text-link">SkillsHub</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-primary/60">{t.tagline}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary">{t.languagesTitle}</h3>
            <ul className="mt-4 space-y-2 text-sm text-primary/60">
              {t.languages.map((language) => (
                <li key={language}>{language}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary">{t.platformTitle}</h3>
            <ul className="mt-4 space-y-2 text-sm text-primary/60">
              {strings.landing.nav.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors hover:text-link">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/signup" className="transition-colors hover:text-link">
                  {strings.landing.nav.signup}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-primary/10 pt-6 text-sm text-primary/50">
          {format(t.rights, { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  )
}
