import { useEffect, useRef } from 'react'

/**
 * Reveals an element the first time it scrolls into view by flipping the
 * `data-reveal` attribute the `.reveal` class in index.css keys off.
 *
 * The pending (hidden) state is set from JS rather than in the markup, so if
 * scripting or IntersectionObserver is unavailable the content is simply
 * visible instead of stuck at opacity 0.
 */
export function useReveal({ threshold = 0.15, once = true } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion || typeof IntersectionObserver === 'undefined') return undefined

    node.dataset.reveal = 'pending'

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.dataset.reveal = 'shown'
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            entry.target.dataset.reveal = 'pending'
          }
        }
      },
      { threshold, rootMargin: '0px 0px -10% 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, once])

  return ref
}

export default useReveal
