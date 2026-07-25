const TONES = {
  error: 'border-red-200 bg-red-50 text-red-700',
  warning: 'border-accent/40 bg-accent/10 text-primary',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
}

export default function FormAlert({ children, tone = 'error' }) {
  if (!children) return null

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`whitespace-pre-line rounded-lg border px-4 py-3 text-sm ${TONES[tone]}`}
    >
      {children}
    </div>
  )
}
