const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  accent: 'bg-accent text-primary hover:bg-accent/90',
  outline: 'border border-primary/20 text-primary hover:bg-surface',
}

export default function Button({
  children,
  variant = 'primary',
  as: Component = 'button',
  className = '',
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 font-medium transition-colors disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
