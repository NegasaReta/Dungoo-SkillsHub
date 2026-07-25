import { SCORE_MAX } from '../../constants.js'
import useTilt from '../../hooks/useTilt.js'
import { format, strings } from '../../i18n/en.js'
import Reveal from '../common/Reveal.jsx'
import Icon from './Icon.jsx'

const SKILLS = [
  { key: 'clarity', value: 4.2 },
  { key: 'confidence', value: 3.6 },
  { key: 'star', value: 4.5 },
]

const AVERAGE_SCORE = SKILLS.reduce((total, skill) => total + skill.value, 0) / SKILLS.length

export default function PassportPreview() {
  const t = strings.landing.passport
  const labels = strings.landing.scoreLabels
  const { ref, tiltProps } = useTilt({ max: 10 })

  return (
    <section id="passport" className="relative overflow-hidden bg-canvas py-16 md:py-24">
      <div
        aria-hidden="true"
        className="orb orb-blue pointer-events-none absolute -right-24 top-1/4 h-80 w-80"
      />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 lg:grid-cols-2 lg:items-center lg:gap-20">
        <Reveal>
          <p className="font-medium text-link">{t.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold text-primary md:text-5xl">{t.title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-primary/70">{t.body}</p>

          <ul className="mt-8 space-y-4">
            {t.benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-base text-primary/80">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <Icon name="check" className="h-3.5 w-3.5" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </Reveal>

        <div ref={ref} {...tiltProps} className="scene-3d">
          <div className="tilt-3d relative">
            {/* Holographic rim, offset so it reads as light bleeding out from
                behind the card rather than a border on it. */}
            <div
              aria-hidden="true"
              className="holo-edge pointer-events-none absolute -inset-[2px] rounded-[1.6rem] opacity-70 blur-[2px]"
            />
            <div
              aria-hidden="true"
              className="holo-edge pointer-events-none absolute -inset-6 rounded-[2rem] opacity-30 blur-2xl"
            />

            {/* The credential itself sits on the navy brand surface so it reads
                as an object rather than another page section. */}
            <div className="sheen relative overflow-hidden rounded-3xl border border-white/10 bg-navy p-7 text-white shadow-2xl shadow-navy/30">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent/20 blur-3xl"
              />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/60">{t.cardLabel}</p>
                  <p className="text-xl font-semibold">{t.cardRole}</p>
                </div>
                <span className="depth-2 shrink-0 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-navy shadow-lg shadow-accent/30">
                  {format(t.cardAverage, {
                    score: AVERAGE_SCORE.toFixed(1),
                    max: SCORE_MAX,
                  })}
                </span>
              </div>

              <div className="relative mt-7 space-y-5">
                {SKILLS.map((skill) => (
                  <div key={skill.key}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{labels[skill.key]}</span>
                      <span className="font-semibold">
                        {skill.value.toFixed(1)}
                        <span className="font-normal text-white/50"> / {SCORE_MAX}</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-white/15">
                      <div
                        className="h-2 rounded-full bg-accent"
                        style={{ width: `${(skill.value / SCORE_MAX) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative mt-7 flex items-center justify-between border-t border-white/15 pt-5 text-sm">
                <span className="text-white/60">{t.cardSessions}</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-accent">
                  <Icon name="shield" className="h-4 w-4" />
                  {t.cardVerified}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
