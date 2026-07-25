const STATS = [
  { value: '~7%', label: 'GDP growth', detail: "Ethiopia's economy keeps expanding." },
  { value: '~27%', label: 'Urban youth unemployment', detail: 'Yet capable graduates stay unhired.' },
  { value: '0', label: 'Affordable coaching at scale', detail: 'Private training centres price youth out.' },
]

export default function ProblemStats() {
  return (
    <section className="bg-primary py-16 text-white md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold md:text-4xl">
            The gap isn&apos;t ambition. It&apos;s <span className="text-accent">soft skills</span>.
          </h2>
          <p className="mt-4 text-white/70">
            Ethiopia is growing without creating matching opportunity — a classic jobless-growth
            pattern. Rote-memorisation education leaves graduates without professional English
            fluency or interview confidence, even when their technical qualifications are sound.
          </p>
        </div>

        <dl className="mt-12 grid gap-8 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="border-t border-white/15 pt-5">
              <dd className="text-4xl font-bold text-accent">{stat.value}</dd>
              <dt className="mt-2 font-medium">{stat.label}</dt>
              <p className="mt-1 text-sm text-white/60">{stat.detail}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
