import { passwordStrength } from '../../lib/validation.js'

// Indexed by how many rules are met, so the class names stay static for Tailwind.
const TONES = [
  { bar: 'bg-danger', text: 'text-danger' },
  { bar: 'bg-danger', text: 'text-danger' },
  { bar: 'bg-warning', text: 'text-warning' },
  { bar: 'bg-warning', text: 'text-warning' },
  { bar: 'bg-accent', text: 'text-warning' },
  { bar: 'bg-success', text: 'text-success' },
]

export default function PasswordStrengthMeter({ value }) {
  if (!value) return null

  const { met, total, label } = passwordStrength(value)
  const tone = TONES[met]

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-primary/50">Password strength</span>
        <span className={`font-medium ${tone.text}`}>{label}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={met}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Password strength"
        className="mt-1 h-1.5 overflow-hidden rounded-full bg-primary/10"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${tone.bar}`}
          style={{ width: `${(met / total) * 100}%` }}
        />
      </div>
    </div>
  )
}
