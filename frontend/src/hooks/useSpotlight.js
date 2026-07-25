import { useCallback, useMemo, useRef } from 'react'

function pointerLightAllowed() {
  if (typeof window === 'undefined') return false
  // Needs a real pointer to follow; touch would leave the light stranded.
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/**
 * Moves the `.spotlight` highlight with the pointer by writing `--sx` / `--sy`
 * as percentages. Same contract as `useTilt`, minus the rotation, for cards
 * that should catch the light without leaning.
 */
export function useSpotlight() {
  const ref = useRef(null)
  const enabled = useMemo(pointerLightAllowed, [])

  const handlePointerMove = useCallback(
    (event) => {
      const node = ref.current
      if (!node) return

      const bounds = node.getBoundingClientRect()
      node.style.setProperty('--sx', `${((event.clientX - bounds.left) / bounds.width) * 100}%`)
      node.style.setProperty('--sy', `${((event.clientY - bounds.top) / bounds.height) * 100}%`)
    },
    []
  )

  return {
    ref,
    spotlightProps: enabled ? { onPointerMove: handlePointerMove } : {},
  }
}

export default useSpotlight
