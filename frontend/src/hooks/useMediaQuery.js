import { useEffect, useState } from 'react'

/**
 * Subscribes to a media query. Used to keep the WebGL hero off small screens and
 * off devices asking for reduced motion, so the decision reacts to a rotated
 * phone or a changed OS setting rather than only being read once at mount.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (!window.matchMedia) return undefined

    const list = window.matchMedia(query)
    const onChange = (event) => setMatches(event.matches)

    setMatches(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

export default useMediaQuery
