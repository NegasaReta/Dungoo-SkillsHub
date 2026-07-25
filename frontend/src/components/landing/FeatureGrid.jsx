import Icon from './Icon.jsx'

const FEATURES = [
  {
    icon: 'mic',
    title: 'AI video mock interviews',
    body: 'Role-matched questions, in-browser recording, and per-answer scoring on clarity, confidence, and STAR structure.',
    status: 'Available now',
  },
  {
    icon: 'passport',
    title: 'Skill Passport',
    body: 'Every session aggregates into one persistent, shareable credential that proves what you can actually do.',
    status: 'Available now',
  },
  {
    icon: 'chart',
    title: 'Progress dashboard',
    body: 'Track score growth across sessions so you can see exactly which skill moved and which one stalled.',
    status: 'Available now',
  },
  {
    icon: 'users',
    title: 'Peer language exchange',
    body: 'Trade the language you know for the one you want, across Amharic, Afaan Oromoo, Tigrinya, and English.',
    status: 'Coming soon',
  },
  {
    icon: 'chat',
    title: 'AI communication practice',
    body: 'Guided professional-English exercises with instant corrections tuned to Ethiopian-accented speech.',
    status: 'Coming soon',
  },
  {
    icon: 'store',
    title: 'Verified expert marketplace',
    body: 'Book vetted language teachers, industry professionals, and trainers for live paid sessions.',
    status: 'Phase 2',
  },
]

const STATUS_STYLES = {
  'Available now': 'bg-accent/15 text-primary',
  'Coming soon': 'bg-brand-blue/10 text-brand-blue',
  'Phase 2': 'bg-primary/5 text-primary/60',
}

export default function FeatureGrid() {
  return (
    <section id="features" className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="font-medium text-brand-blue">Features</p>
          <h2 className="mt-2 text-3xl font-bold text-primary md:text-4xl">
            One integrated platform, not another single-purpose app
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                <Icon name={feature.icon} />
              </span>
              <div className="mt-5 flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-primary">{feature.title}</h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[feature.status]}`}
                >
                  {feature.status}
                </span>
              </div>
              <p className="mt-2 text-primary/70">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
