import { strings } from '../../i18n/en.js'
import Reveal from '../common/Reveal.jsx'

export default function Differentiators() {
  const t = strings.landing.why

  return (
    <section id="why" className="relative overflow-hidden bg-surface py-16 md:py-24">
      <div
        aria-hidden="true"
        className="orb orb-blue pointer-events-none absolute -right-20 bottom-0 h-72 w-72"
      />

      <div className="relative mx-auto max-w-7xl px-4">
        <Reveal className="max-w-4xl">
          <p className="font-medium text-link">{t.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold text-primary md:text-5xl">{t.title}</h2>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {t.items.map((point, index) => (
            <Reveal key={point.title} delay={(index % 2) * 120}>
              <div className="lift spotlight h-full rounded-2xl border border-primary/10 border-l-2 border-l-accent bg-panel p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-primary">{point.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-primary/70">{point.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
