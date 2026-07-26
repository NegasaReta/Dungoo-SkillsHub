import { passwordRuleState } from '../../lib/validation.js'

export default function PasswordChecklist({ value }) {
  return (
    <ul className="mt-2 grid gap-1 sm:grid-cols-2">
      {passwordRuleState(value).map((rule) => (
        <li
          key={rule.id}
          className={`flex items-center gap-1.5 text-xs ${
            rule.passed ? 'text-success' : 'text-primary/50'
          }`}
        >
          <span
            aria-hidden="true"
            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] leading-none ${
              rule.passed ? 'bg-success text-white' : 'border border-primary/25'
            }`}
          >
            {rule.passed ? '✓' : ''}
          </span>
          <span className="sr-only">{rule.passed ? 'Met:' : 'Not met:'}</span>
          {rule.label}
        </li>
      ))}
    </ul>
  )
}
