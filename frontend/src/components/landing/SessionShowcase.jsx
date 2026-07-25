import { strings } from '../../i18n/en.js'
import avif480 from '../../assets/landing/session-showcase-480.avif'
import avif766 from '../../assets/landing/session-showcase-766.avif'
import webp480 from '../../assets/landing/session-showcase-480.webp'
import webp766 from '../../assets/landing/session-showcase-766.webp'
import Reveal from '../common/Reveal.jsx'
import Icon from './Icon.jsx'

// The image column is roughly 40rem on large screens and full width below that.
const SIZES = '(min-width: 1024px) 40rem, calc(100vw - 2rem)'

export default function SessionShowcase() {
  const t = strings.landing.showcase

  return (
    <section className="relative overflow-hidden bg-canvas pb-16 md:pb-24">
      <div
        aria-hidden="true"
        className="orb orb-accent pointer-events-none absolute -left-32 top-1/4 h-72 w-72"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <Reveal>
          <figure className="lift sheen overflow-hidden rounded-3xl border border-primary/10 bg-navy p-2 shadow-2xl shadow-navy/25">
            <picture>
              <source type="image/avif" srcSet={`${avif480} 480w, ${avif766} 766w`} sizes={SIZES} />
              <source type="image/webp" srcSet={`${webp480} 480w, ${webp766} 766w`} sizes={SIZES} />
              <img
                src={webp766}
                alt={t.alt}
                width={766}
                height={423}
                loading="lazy"
                decoding="async"
                className="w-full rounded-2xl"
              />
            </picture>
            <figcaption className="px-3 py-2.5 text-xs text-white/55">{t.caption}</figcaption>
          </figure>
        </Reveal>

        <Reveal delay={120}>
          <p className="font-medium text-link">{t.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold leading-tight text-primary md:text-5xl">
            {t.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-primary/70">{t.body}</p>

          <ul className="mt-7 space-y-3.5">
            {t.points.map((point) => (
              <li key={point} className="flex gap-3 text-base leading-relaxed text-primary/75">
                <Icon name="check" className="mt-1 h-5 w-5 shrink-0 text-success" />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
