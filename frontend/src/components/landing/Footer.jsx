import { Link } from 'react-router-dom'

import { format, strings } from '../../i18n/en.js'
import SocialIcon from '../common/SocialIcon.jsx'

const linkClasses = 'text-white/70 transition-colors hover:text-accent'

function LinkColumn({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-accent">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm">{children}</ul>
    </div>
  )
}

export default function Footer() {
  const t = strings.landing.footer

  // `navy` stays dark in both themes, so the ink here is white rather than
  // `text-primary`, which inverts with the theme.
  return (
    <footer className="bg-navy text-white">
      <div
        aria-hidden="true"
        className="h-1 bg-gradient-to-r from-brand-blue via-accent to-brand-blue"
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
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

            <a
              href={strings.site.href}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              {strings.site.label}
            </a>

            <p className="mt-6 text-[10px] font-semibold uppercase tracking-widest text-white/50">
              {t.languagesTitle}
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/60">
              {t.languages.map((language) => (
                <li key={language} className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent/70" />
                  {language}
                </li>
              ))}
            </ul>

            <ul className="mt-6 flex flex-wrap items-center gap-2">
              {strings.social.links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={link.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-accent hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <SocialIcon name={link.id} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <LinkColumn title={t.productTitle}>
              {t.product.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClasses}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </LinkColumn>

            <LinkColumn title={t.platformTitle}>
              {/* Rooted at "/" so a section anchor still works from a footer page. */}
              {strings.landing.nav.links.map((link) => (
                <li key={link.href}>
                  <a href={`/${link.href}`} className={linkClasses}>
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/signup" className={linkClasses}>
                  {strings.landing.nav.signup}
                </Link>
              </li>
            </LinkColumn>

            <LinkColumn title={t.companyTitle}>
              {t.company.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClasses}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </LinkColumn>

            <LinkColumn title={t.legalTitle}>
              {t.legal.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClasses}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </LinkColumn>
          </div>
        </div>

        <p className="mt-10 border-t border-white/15 pt-6 text-sm text-white/60">
          {format(t.rights, { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  )
}
