const STEPS = [
  {
    title: 'Tell us your goal',
    body: 'A two-minute sign-up captures your name, target role, and language profile. No CV upload, no fees.',
  },
  {
    title: 'Practice on camera',
    body: 'Answer role-matched interview questions in the browser. Record, review, and retry as often as you like.',
  },
  {
    title: 'Get scored in seconds',
    body: 'The AI rates every answer on clarity, confidence, and STAR structure, with specific notes on what to change.',
  },
  {
    title: 'Build your Skill Passport',
    body: 'Each session feeds a persistent credential that shows your growth and gives employers a readiness signal.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="font-medium text-brand-blue">How it works</p>
          <h2 className="mt-2 text-3xl font-bold text-primary md:text-4xl">
            One practice loop, from first answer to shareable credential
          </h2>
        </div>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-primary">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-primary">{step.title}</h3>
              <p className="mt-2 text-primary/70">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
