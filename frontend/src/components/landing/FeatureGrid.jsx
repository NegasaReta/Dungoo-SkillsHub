import { strings } from '../../i18n/en.js'
import Reveal from '../common/Reveal.jsx'
import Icon from './Icon.jsx'
import TiltCard from './TiltCard.jsx'

const STATUS_STYLES = {
  'Available now': 'bg-accent/15 text-primary ring-1 ring-accent/30',
  'Coming soon': 'bg-brand-blue/10 text-link ring-1 ring-brand-blue/25',
  'Phase 2': 'bg-primary/5 text-primary/60 ring-1 ring-primary/10',
}

export default function FeatureGrid() {
  const t = strings.landing.features

  return (
    <section id="features" className="relative overflow-hidden bg-surface py-16 md:py-24">
      <div
        aria-hidden="true"
        className="orb orb-accent pointer-events-none absolute -left-28 top-1/4 h-72 w-72"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-medium text-link">{t.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold text-primary md:text-4xl">{t.title}</h2>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {t.items.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 3) * 110}>
              <TiltCard
                as="article"
                className="spotlight sheen rounded-2xl border border-primary/10 bg-panel p-6 shadow-sm hover:shadow-xl hover:shadow-navy/10"
              >
                <span className="depth-2 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 text-link ring-1 ring-brand-blue/20">
                  <Icon name={feature.icon} />
                </span>
                <div className="mt-5 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-primary">{feature.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      STATUS_STYLES[feature.status]
                    }`}
                  >
                    {feature.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-primary/70">{feature.body}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
