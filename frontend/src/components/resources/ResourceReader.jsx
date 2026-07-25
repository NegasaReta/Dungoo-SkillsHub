import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

import { FORMATS } from '../../data/resources.js'
import { format, strings } from '../../i18n/en.js'
import NavIcon from '../app/NavIcon.jsx'

/**
 * Reads one resource in place. Rendered into a portal on <body> so that printing
 * produces the guide alone — see the print rule in index.css.
 */
export default function ResourceReader({ resource, onClose }) {
  useEffect(() => {
    if (!resource) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.classList.add('resource-reader-open')
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('resource-reader-open')
      document.body.style.overflow = ''
    }
  }, [resource, onClose])

  if (!resource) return null

  const isDrill = resource.format === 'drill'
  const isVideo = resource.format === 'video'
  const meta = isVideo
    ? format(strings.resources.videoBy, { channel: resource.channel })
    : format(isDrill ? strings.resources.minutesPractice : strings.resources.minutesRead, {
        minutes: resource.minutes,
      })

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-primary/50 p-4 backdrop-blur-sm print:static print:block print:overflow-visible print:bg-white print:p-0"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <article
        role="dialog"
        aria-modal="true"
        aria-label={resource.title}
        className="my-6 h-fit w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl sm:p-8 print:my-0 print:max-w-none print:shadow-none"
      >
        <header className="flex items-start justify-between gap-4 border-b border-primary/10 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-blue">
              <NavIcon name={FORMATS[resource.format].icon} className="h-3.5 w-3.5" />
              {FORMATS[resource.format].label}
            </span>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-primary">
              {resource.title}
            </h1>
            <p className="mt-1 text-xs text-primary/50">
              {meta} · {resource.level}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={strings.resources.close}
            className="shrink-0 rounded-lg border border-primary/15 p-2 text-primary/60 transition-colors hover:bg-surface hover:text-primary print:hidden"
          >
            <NavIcon name="close" className="h-4 w-4" />
          </button>
        </header>

        {isVideo && (
          <div className="mt-6 print:hidden">
            <div className="aspect-video overflow-hidden rounded-xl bg-primary/10">
              <iframe
                // Loaded only now, on open, and from the no-cookie host.
                src={`https://www.youtube-nocookie.com/embed/${resource.videoId}?rel=0`}
                title={resource.title}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
            <p className="mt-2 text-[11px] text-primary/45">{strings.resources.watchNote}</p>
          </div>
        )}

        <div className="mt-6 space-y-8">
          {resource.body.map((section) => (
            <section key={section.heading}>
              <h2 className="text-base font-semibold text-primary">{section.heading}</h2>

              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-sm leading-relaxed text-primary/70">
                  {paragraph}
                </p>
              ))}

              {section.example && (
                <blockquote className="mt-4 rounded-xl border-l-4 border-accent bg-surface p-4 text-sm italic leading-relaxed text-primary/75">
                  {section.example}
                </blockquote>
              )}

              {section.paragraphsAfter?.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-sm leading-relaxed text-primary/70">
                  {paragraph}
                </p>
              ))}

              {section.bullets && (
                <ul className="mt-3 space-y-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-primary/70">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <footer className="mt-8 flex flex-wrap items-center gap-3 border-t border-primary/10 pt-5 print:hidden">
          {isDrill && resource.action && (
            <Link
              to={resource.action.to}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90"
            >
              {resource.action.label}
              <NavIcon name="arrow" className="h-4 w-4" />
            </Link>
          )}

          {isVideo ? (
            <a
              href={`https://www.youtube.com/watch?v=${resource.videoId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-primary/15 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
            >
              <NavIcon name="share" className="h-4 w-4" />
              {strings.resources.openOnYoutube}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-primary/15 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
            >
              <NavIcon name="download" className="h-4 w-4" />
              {strings.resources.print}
            </button>
          )}
        </footer>
      </article>
    </div>,
    document.body
  )
}
