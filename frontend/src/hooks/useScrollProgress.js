import { useEffect, useRef } from 'react'

/**
 * Scroll position through the first viewport, as 0..1 in a ref rather than
 * state: the 3D scene samples it once per frame, and re-rendering React on every
 * scroll event would cost far more than the animation it drives.
 */
export function useScrollProgress() {
  const progress = useRef(0)

  useEffect(() => {
    function update() {
      const span = window.innerHeight || 1
      progress.current = Math.min(window.scrollY / span, 1)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return progress
}

export default useScrollProgress
