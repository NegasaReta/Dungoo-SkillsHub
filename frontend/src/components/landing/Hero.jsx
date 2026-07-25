import { Link } from 'react-router-dom'

import { strings } from '../../i18n/en.js'
import Button from '../common/Button.jsx'
import HeroScene from './HeroScene.jsx'
import Icon from './Icon.jsx'

export default function Hero() {
  const t = strings.landing.hero

  return (
    <section className="relative overflow-hidden bg-canvas">
      {/* Perspective horizon behind the content. */}
      <div aria-hidden="true" className="scene-3d pointer-events-none absolute inset-0">
        <div className="grid-floor absolute inset-x-0 bottom-0 h-[420px]" />
      </div>
      <div
        aria-hidden="true"
        className="orb orb-blue pointer-events-none absolute -top-40 left-1/2 h-[26rem] w-[46rem] -translate-x-1/2"
      />
      <div
        aria-hidden="true"
        className="orb orb-accent float-slower pointer-events-none absolute -left-24 top-1/3 h-72 w-72"
      />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-20">
        <div className="rise-in">
          <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-link shadow-sm">
            <Icon name="globe" className="h-4 w-4" />
            {t.badge}
          </span>

          <h1 className="mt-5 text-4xl font-bold leading-[1.08] text-primary md:text-6xl lg:text-7xl">
            {t.titleLead}
            <span className="mt-2 block bg-gradient-to-r from-link via-brand-blue to-accent bg-clip-text text-transparent">
              {t.titleAccent}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary/70 md:text-xl">
            {t.body}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              as={Link}
              to="/signup"
              variant="accent"
              className="gap-2 px-6 py-3 shadow-lg shadow-accent/25 transition-transform hover:-translate-y-0.5"
            >
              <Icon name="play" className="h-4 w-4" />
              {t.primaryCta}
            </Button>
            <Button
              as="a"
              href="#how-it-works"
              variant="outline"
              className="gap-2 px-6 py-3 transition-transform hover:-translate-y-0.5"
            >
              {t.secondaryCta}
              <Icon name="arrow" className="h-4 w-4" />
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-base text-primary/60">
            {t.trust.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Icon name="check" className="h-4 w-4 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rise-in lg:pl-4">
          <HeroScene />
        </div>
      </div>
    </section>
  )
}
