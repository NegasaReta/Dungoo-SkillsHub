/**
 * The interviewer's profile picture. Stands in for a camera the way a meeting
 * client shows an avatar for a participant who joined with video off.
 */
export default function AiAvatar({ className = 'h-24 w-24' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-blue ring-2 ring-white/20 ${className}`}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true" className="h-[55%] w-[55%]">
        <circle cx="24" cy="16" r="8" fill="var(--color-accent)" />
        <path
          d="M8 44c0-8.8 7.2-16 16-16s16 7.2 16 16"
          fill="var(--color-accent)"
          opacity="0.85"
        />
      </svg>
    </span>
  )
}
