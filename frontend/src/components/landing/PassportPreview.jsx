const SKILLS = [
  { label: 'Clarity', value: 8.4 },
  { label: 'Confidence', value: 7.1 },
  { label: 'STAR structure', value: 9.0 },
]

const BENEFITS = [
  'Built automatically from real practice sessions, not self-reported claims.',
  'Shows growth over time, so effort is visible even before the first job offer.',
  'Gives employers a readiness signal for candidates they would otherwise never screen.',
]

export default function PassportPreview() {
  return (
    <section id="passport" className="py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-medium text-brand-blue">Skill Passport</p>
          <h2 className="mt-2 text-3xl font-bold text-primary md:text-4xl">
            Proof you can point to, not a promise you have to make
          </h2>
          <p className="mt-4 text-primary/70">
            Employers can&apos;t interview everyone, so capable youth stay invisible. The Skill
            Passport turns your practice history into a verifiable credential — one link that shows
            what you have worked on and how far you have come.
          </p>

          <ul className="mt-8 space-y-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-primary/80">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-white p-7 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-primary/60">Skill Passport</p>
              <p className="text-xl font-semibold text-primary">Junior Software Engineer</p>
            </div>
            <span className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-primary">
              8.2 avg
            </span>
          </div>

          <div className="mt-7 space-y-5">
            {SKILLS.map((skill) => (
              <div key={skill.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary/70">{skill.label}</span>
                  <span className="font-semibold text-primary">{skill.value.toFixed(1)}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-surface">
                  <div
                    className="h-2 rounded-full bg-brand-blue"
                    style={{ width: `${skill.value * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex justify-between border-t border-primary/10 pt-5 text-sm">
            <span className="text-primary/60">6 sessions completed</span>
            <span className="font-medium text-brand-blue">Verified by Dungoo</span>
          </div>
        </div>
      </div>
    </section>
  )
}
