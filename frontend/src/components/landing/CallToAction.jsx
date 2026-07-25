import { Link } from 'react-router-dom'

import { strings } from '../../i18n/en.js'
import Button from '../common/Button.jsx'
import Reveal from '../common/Reveal.jsx'
import Icon from './Icon.jsx'

export default function CallToAction() {
  const t = strings.landing.cta

  return (
    <section className="bg-canvas py-16 md:py-24">
      <Reveal className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="sheen relative overflow-hidden rounded-3xl bg-navy px-6 py-14 text-center shadow-2xl shadow-navy/25 md:px-16">
          <div aria-hidden="true" className="scene-3d pointer-events-none absolute inset-0">
            <div className="grid-floor-inverse absolute inset-x-0 bottom-0 h-72" />
          </div>
          <div
            aria-hidden="true"
            className="orb orb-accent pointer-events-none absolute -top-24 left-1/2 h-72 w-96 -translate-x-1/2"
          />
          <div
            aria-hidden="true"
            className="orb orb-blue float-slower pointer-events-none absolute -bottom-16 -left-10 h-64 w-64"
          />

          <div className="relative">
            <h2 className="text-3xl font-bold text-white md:text-4xl">{t.title}</h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/70">{t.body}</p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                as={Link}
                to="/signup"
                variant="accent"
                className="gap-2 px-6 py-3 shadow-lg shadow-accent/25 transition-transform hover:-translate-y-0.5"
              >
                {t.primary}
                <Icon name="arrow" className="h-4 w-4" />
              </Button>
              <Button as="a" href="#how-it-works" variant="ghost" className="px-6 py-3">
                {t.secondary}
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
