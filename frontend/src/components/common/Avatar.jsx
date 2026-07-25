const SIZES = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-20 w-20 text-2xl',
}

export function initialsFor(user) {
  const letters = [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('')
  return letters.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'
}

/** Profile picture when one has been uploaded, initials otherwise. */
export default function Avatar({ user, src = '', size = 'sm', className = '' }) {
  const base = `flex shrink-0 items-center justify-center overflow-hidden rounded-full ${SIZES[size]} ${className}`

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${base} object-cover ring-1 ring-primary/10`}
      />
    )
  }

  return (
    <span className={`${base} bg-brand-blue font-semibold text-white`} aria-hidden="true">
      {initialsFor(user)}
    </span>
  )
}
