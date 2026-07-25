const TONES = {
  error: 'border-danger/35 bg-danger/10 text-danger',
  warning: 'border-accent/40 bg-accent/10 text-primary',
  success: 'border-success/35 bg-success/10 text-success',
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
