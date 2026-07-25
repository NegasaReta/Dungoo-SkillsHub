import { strings } from '../../i18n/en.js'
import Reveal from '../common/Reveal.jsx'
import TiltCard from './TiltCard.jsx'

export default function HowItWorks() {
  const t = strings.landing.steps

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-canvas py-16 md:py-24">
      <div
        aria-hidden="true"
        className="orb orb-blue pointer-events-none absolute -right-32 top-10 h-72 w-72"
      />

      <div className="relative mx-auto max-w-6xl px-4">
        <Reveal className="max-w-2xl">
          <p className="font-medium text-link">{t.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold text-primary md:text-4xl">{t.title}</h2>
        </Reveal>

        <ol className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Thread linking the four steps on wide screens. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-[2.1rem] hidden h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent lg:block"
          />

          {t.items.map((step, index) => (
            <li key={step.title} className="relative">
              <Reveal delay={index * 100}>
                <TiltCard
                  max={6}
                  className="spotlight rounded-2xl border border-primary/10 bg-panel p-6 shadow-sm hover:shadow-xl hover:shadow-navy/10"
                >
                  <span className="depth-2 flex h-11 w-11 items-center justify-center rounded-xl bg-accent font-bold text-navy shadow-lg shadow-accent/30">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-primary">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-primary/70">{step.body}</p>
                </TiltCard>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
