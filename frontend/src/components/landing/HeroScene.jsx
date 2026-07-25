import { SCORE_MAX } from '../../constants.js'
import useTilt from '../../hooks/useTilt.js'
import { strings } from '../../i18n/en.js'
import Icon from './Icon.jsx'

const SAMPLE_SCORES = [
  { key: 'clarity', value: 4.2 },
  { key: 'confidence', value: 3.6 },
  { key: 'star', value: 4.5 },
]

/**
 * The hero's 3D centrepiece: a mock-interview card that tilts toward the
 * pointer, with score chips floating in front of it on separate Z planes.
 * Everything is CSS transforms — no 3D library, and it degrades to a flat card
 * on touch screens and for reduced-motion users.
 */
export default function HeroScene() {
  const t = strings.landing.hero
  const labels = strings.landing.scoreLabels
  const { ref, tiltProps } = useTilt({ max: 8 })

  return (
    <div ref={ref} {...tiltProps} className="scene-3d relative mx-auto w-full max-w-lg">
      <div
        aria-hidden="true"
        className="orb orb-blue pointer-events-none absolute -left-10 -top-10 h-56 w-56"
      />
      <div
        aria-hidden="true"
        className="orb orb-accent pointer-events-none absolute -bottom-12 -right-6 h-56 w-56"
      />

      <div className="tilt-3d relative">
        {/* Stacked plates behind the card imply physical depth. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-6 -bottom-4 h-full rounded-3xl border border-primary/10 bg-panel/60"
          style={{ transform: 'translateZ(-60px)' }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-3 -bottom-2 h-full rounded-3xl border border-primary/10 bg-panel/80"
          style={{ transform: 'translateZ(-30px)' }}
        />

        <div className="spotlight sheen relative rounded-3xl border border-primary/10 bg-panel p-6 shadow-2xl shadow-navy/20 sm:p-7">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary/60">{t.cardQuestion}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              {t.cardRecording}
            </span>
          </div>

          <p className="mt-4 text-lg leading-snug text-primary">{t.cardPrompt}</p>

          <div className="mt-6 space-y-4">
            {SAMPLE_SCORES.map((score) => (
              <div key={score.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary/70">{labels[score.key]}</span>
                  <span className="font-semibold text-primary">
                    {score.value.toFixed(1)}
                    <span className="font-normal text-primary/50"> / {SCORE_MAX}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-track">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${(score.value / SCORE_MAX) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 rounded-xl bg-surface p-4 text-sm leading-relaxed text-primary/70">
            {t.cardFeedback}
          </p>
        </div>

        <div className="depth-3 float-slow absolute -left-6 top-16 hidden sm:block">
          <span className="inline-flex items-center gap-2 rounded-2xl border border-primary/10 bg-panel px-3.5 py-2.5 text-xs font-semibold text-primary shadow-xl shadow-navy/15">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-accent">
              <Icon name="bolt" className="h-4 w-4" />
            </span>
            {t.liveChip}
          </span>
        </div>

        <div className="depth-2 float-slower absolute -right-4 bottom-10 hidden sm:block">
          <span className="inline-flex items-center gap-2 rounded-2xl border border-primary/10 bg-panel px-3.5 py-2.5 text-xs font-semibold text-primary shadow-xl shadow-navy/15">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue/15 text-link">
              <Icon name="passport" className="h-4 w-4" />
            </span>
            {t.passportChip}
          </span>
        </div>
      </div>
    </div>
  )
}
