import { Link } from 'react-router-dom'

import Button from '../common/Button.jsx'

import { SCORE_MAX } from '../../constants.js'

const SAMPLE_SCORES = [
  { label: 'Clarity', value: 4.2 },
  { label: 'Confidence', value: 3.6 },
  { label: 'STAR structure', value: 4.5 },
]

export default function Hero() {
  return (
    <section className="bg-surface">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-blue/10 px-3 py-1 text-sm text-brand-blue">
            Built in Ethiopia, for Ethiopian youth
          </span>

          <h1 className="mt-5 text-4xl font-bold leading-tight text-primary md:text-5xl">
            Your qualifications are ready.
            <span className="text-brand-blue"> Now get your confidence there too.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-primary/70">
            Dungoo SkillsHub is an AI-powered career readiness platform. Practice real interviews on
            camera, get scored on clarity, confidence, and STAR structure in seconds, and turn every
            session into a Skill Passport employers can trust.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to="/onboarding" variant="accent" className="px-6 py-3">
              Start a mock interview
            </Button>
            <Button as="a" href="#how-it-works" variant="outline" className="px-6 py-3">
              See how it works
            </Button>
          </div>

          <p className="mt-6 text-sm text-primary/60">
            Free to start · Works on low-bandwidth connections · Amharic, Afaan Oromoo, Tigrinya
            &amp; English
          </p>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary/60">Question 2 of 5</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Recording
            </span>
          </div>

          <p className="mt-4 text-lg text-primary">
            “Tell me about a problem you solved that others on your team had missed.”
          </p>

          <div className="mt-6 space-y-4">
            {SAMPLE_SCORES.map((score) => (
              <div key={score.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary/70">{score.label}</span>
                  <span className="font-semibold text-primary">
                    {score.value.toFixed(1)}
                    <span className="font-normal text-primary/50"> / {SCORE_MAX}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-surface">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${(score.value / SCORE_MAX) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 rounded-lg bg-surface p-4 text-sm text-primary/70">
            Strong result and a clear outcome. Next time, name the specific metric you improved so
            the impact lands faster.
          </p>
        </div>
      </div>
    </section>
  )
}
