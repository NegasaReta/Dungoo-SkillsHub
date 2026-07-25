import useSpotlight from '../../hooks/useSpotlight.js'

/**
 * The app's standard card. `spotlight` adds a pointer-tracked highlight and
 * `lift` a hover elevation — both opt-in, so static panels stay still and only
 * the ones a user is meant to poke at react.
 */
export default function Panel({ children, className = '', spotlight = false, lift = false }) {
  const { ref, spotlightProps } = useSpotlight()

  return (
    <section
      ref={spotlight ? ref : undefined}
      {...(spotlight ? spotlightProps : {})}
      className={`rounded-2xl border border-primary/10 bg-panel p-5 shadow-sm ${
        spotlight ? 'spotlight' : ''
      } ${lift ? 'lift' : ''} ${className}`}
    >
      {children}
    </section>
  )
}
