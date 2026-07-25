import { Link } from 'react-router-dom'

import Button from '../common/Button.jsx'

export default function CallToAction() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl bg-primary px-6 py-14 text-center md:px-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Your next interview can be your best one
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Start with one mock interview. Get scored in seconds, see exactly what to fix, and leave
            with the first entry in your Skill Passport.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button as={Link} to="/signup" variant="accent" className="px-6 py-3">
              Start practicing free
            </Button>
            <Button
              as="a"
              href="#how-it-works"
              className="border border-white/25 bg-transparent px-6 py-3 text-white hover:bg-white/10"
            >
              Learn more
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
