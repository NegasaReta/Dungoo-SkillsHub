import { strings } from '../../i18n/en.js'
import Reveal from '../common/Reveal.jsx'
import TiltCard from './TiltCard.jsx'

export default function ProblemStats() {
  const t = strings.landing.stats

  return (
    <section className="relative overflow-hidden bg-navy py-16 text-white md:py-20">
      <div aria-hidden="true" className="scene-3d pointer-events-none absolute inset-0">
        <div className="grid-floor-inverse absolute inset-x-0 bottom-0 h-80" />
      </div>
      <div
        aria-hidden="true"
        className="orb orb-accent pointer-events-none absolute -right-20 top-0 h-72 w-72"
      />
      <div
        aria-hidden="true"
        className="orb orb-blue float-slow pointer-events-none absolute -left-16 bottom-0 h-64 w-64"
      />

      <div className="relative mx-auto max-w-7xl px-4">
        <Reveal className="max-w-4xl">
          <h2 className="text-3xl font-bold md:text-5xl">
            {t.title} <span className="text-accent">{t.titleAccent}</span>.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">{t.body}</p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {t.items.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 110}>
              <TiltCard
                max={6}
                className="sheen rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur hover:border-accent/40"
              >
                <p className="depth-1 text-4xl font-bold text-accent md:text-5xl">{stat.value}</p>
                <p className="mt-2 text-lg font-medium">{stat.label}</p>
                <p className="mt-1 text-base text-white/60">{stat.detail}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
