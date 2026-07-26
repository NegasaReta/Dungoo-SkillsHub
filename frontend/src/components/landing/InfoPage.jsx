import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { strings } from '../../i18n/en.js'
import Footer from './Footer.jsx'
import Navbar from './Navbar.jsx'

/**
 * Shell for the pages the footer links out to: about, privacy, terms, contact.
 * Same navbar and footer as the landing page, one column of prose in between.
 */
export default function InfoPage({ eyebrow, title, lead, updated, children }) {
  // Arriving from a footer link should start at the top of the new page rather
  // than wherever the previous one was scrolled to.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="bg-panel">
      <Navbar />

      <main>
        <header className="border-b border-primary/10 bg-gradient-to-b from-brand-blue/10 via-canvas to-canvas py-14 md:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <p className="font-medium text-link">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-bold text-primary md:text-4xl">{title}</h1>
            {lead && <p className="mt-4 text-lg leading-relaxed text-primary/70">{lead}</p>}
            {updated && (
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-widest text-primary/45">
                {updated}
              </p>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">{children}</div>
      </main>

      <Footer />
    </div>
  )
}

/** Renders `{ title, body: [], list: [] }` sections, any part of which may be absent. */
export function InfoSections({ sections }) {
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-xl font-semibold text-primary">{section.title}</h2>

          {section.body?.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-sm leading-relaxed text-primary/70">
              {paragraph}
            </p>
          ))}

          {section.list && (
            <ul className="mt-4 space-y-3">
              {section.list.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-primary/70">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

/** Closing line pointing at the contact page, for the pages that are not it. */
export function ContactNote() {
  const t = strings.pages

  return (
    <p className="mt-12 border-t border-primary/10 pt-6 text-sm text-primary/60">
      {t.contactNote}{' '}
      <Link to="/contact" className="font-medium text-link underline-offset-4 hover:underline">
        {t.contactNoteLink}
      </Link>
      .
    </p>
  )
}
