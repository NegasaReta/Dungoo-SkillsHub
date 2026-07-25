const VARIANTS = {
  primary: 'bg-navy text-white hover:bg-navy/90 focus-visible:outline-navy',
  accent: 'bg-accent text-navy hover:bg-accent/90 focus-visible:outline-accent',
  outline: 'border border-primary/20 text-primary hover:bg-surface focus-visible:outline-brand-blue',
  // For use on the navy brand surfaces, where the palette is always inverted.
  ghost: 'border border-white/25 text-white hover:bg-white/10 focus-visible:outline-accent',
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
      className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
