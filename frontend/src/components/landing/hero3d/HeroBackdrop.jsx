import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'

import useMediaQuery, { useReducedMotion } from '../../../hooks/useMediaQuery.js'

const HeroCanvas = lazy(() => import('./HeroCanvas.jsx'))

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Decides whether the hero gets the WebGL layer at all, and only then downloads
 * three.js. Everything behind this gate is decorative: when it declines, the
 * hero keeps its CSS orbs and grid floor and reads identically.
 *
 * It declines on small screens (where the cost is worst and the layer is barely
 * visible), when the visitor asks for reduced motion, when WebGL is missing, and
 * on devices reporting little memory. Rendering also stops while the hero is
 * scrolled out of view or the tab is hidden, so it never burns battery in the
 * background.
 */
export default function HeroBackdrop() {
  const reducedMotion = useReducedMotion()
  const largeEnough = useMediaQuery('(min-width: 768px)')
  const containerRef = useRef(null)
  const [inView, setInView] = useState(true)
  const [tabVisible, setTabVisible] = useState(true)

  const capable = useMemo(() => {
    if (typeof window === 'undefined') return false
    // Chrome-only hint; absent elsewhere, in which case we do not hold it against the device.
    const memory = navigator.deviceMemory
    if (typeof memory === 'number' && memory < 4) return false
    return supportsWebGL()
  }, [])

  const wanted = capable && largeEnough && !reducedMotion

  useEffect(() => {
    if (!wanted) return undefined

    const node = containerRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [wanted])

  useEffect(() => {
    if (!wanted) return undefined

    const onVisibility = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [wanted])

  if (!wanted) return null

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-70 mix-blend-normal"
    >
      <Suspense fallback={null}>
        <HeroCanvas active={inView && tabVisible} />
      </Suspense>
    </div>
  )
}
