import { Link } from 'react-router-dom'

export default function AuthCard({ title, subtitle, children, footer, wide = false }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue font-bold text-white">
          D
        </span>
        <span className="font-semibold text-primary">
          Dungoo <span className="text-brand-blue">SkillsHub</span>
        </span>
      </Link>

      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-primary">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-primary/60">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-primary/60">{footer}</div>}
      </div>
    </main>
  )
}
