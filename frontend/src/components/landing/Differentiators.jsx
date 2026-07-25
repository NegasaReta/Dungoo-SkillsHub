const POINTS = [
  {
    title: 'Built for Ethiopia, not adapted for it',
    body: 'Global tools like Yoodli and Huru are designed for US and UK job markets and priced in dollars. SkillsHub is built ground-up for Ethiopian accents, languages, and workplace norms.',
  },
  {
    title: 'One platform, not a point tool',
    body: 'Language-exchange apps stop at conversation. SkillsHub combines peer practice with structured interview and soft-skills training in a single place.',
  },
  {
    title: 'True multi-language matching',
    body: 'Matching reflects how Ethiopians actually communicate — across Amharic, Afaan Oromoo, Tigrinya, and English, not a single language pair.',
  },
  {
    title: 'It closes the loop on both sides',
    body: 'Youth get affordable practice that scales. Employers get a verified readiness signal they can hire against.',
  },
]

export default function Differentiators() {
  return (
    <section id="why" className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="font-medium text-brand-blue">Why Dungoo</p>
          <h2 className="mt-2 text-3xl font-bold text-primary md:text-4xl">
            Locally built, because imported tools don&apos;t fit
          </h2>
        </div>

        <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {POINTS.map((point) => (
            <div key={point.title} className="border-l-2 border-accent pl-5">
              <h3 className="text-lg font-semibold text-primary">{point.title}</h3>
              <p className="mt-2 text-primary/70">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
