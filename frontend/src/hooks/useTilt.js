import { useCallback, useMemo, useRef } from 'react'

function interactiveTiltAllowed() {
  if (typeof window === 'undefined') return false
  // Skip on touch screens (no hover to drive it) and when motion is reduced.
  return (
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Pointer-driven 3D tilt. Writes `--rx` / `--ry` custom properties consumed by
 * the `.tilt-3d` class in index.css, so the animation stays on the compositor
 * and no state updates are triggered while the pointer moves.
 */
export function useTilt({ max = 9, depth = 0 } = {}) {
  const ref = useRef(null)
  const enabled = useMemo(interactiveTiltAllowed, [])

  const handlePointerMove = useCallback(
    (event) => {
      const node = ref.current
      if (!node || !enabled) return

      const bounds = node.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / bounds.width - 0.5
      const y = (event.clientY - bounds.top) / bounds.height - 0.5

      node.style.setProperty('--ry', `${x * max * 2}deg`)
      node.style.setProperty('--rx', `${-y * max * 2}deg`)
      // Pointer position as a percentage, for the `.spotlight` highlight.
      node.style.setProperty('--sx', `${(x + 0.5) * 100}%`)
      node.style.setProperty('--sy', `${(y + 0.5) * 100}%`)
      if (depth) {
        node.style.setProperty('--px', `${x * depth}px`)
        node.style.setProperty('--py', `${y * depth}px`)
      }
    },
    [enabled, max, depth]
  )

  const reset = useCallback(() => {
    const node = ref.current
    if (!node) return
    node.style.setProperty('--rx', '0deg')
    node.style.setProperty('--ry', '0deg')
    node.style.setProperty('--sx', '50%')
    node.style.setProperty('--sy', '50%')
    node.style.setProperty('--px', '0px')
    node.style.setProperty('--py', '0px')
  }, [])

  return {
    ref,
    enabled,
    tiltProps: enabled ? { onPointerMove: handlePointerMove, onPointerLeave: reset } : {},
  }
}

export default useTilt
