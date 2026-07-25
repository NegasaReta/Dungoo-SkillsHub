import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Popover plumbing shared by the topbar menus: outside-click and Escape both
 * close, and `hover` additionally opens on pointer/keyboard focus with a short
 * grace period so the pointer can travel from the trigger to the panel.
 * A click on the trigger still works, which keeps touch devices usable.
 */
export function useMenu({ hover = false, closeDelay = 180 } = {}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const timerRef = useRef(null)

  const cancelPendingClose = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const openMenu = useCallback(() => {
    cancelPendingClose()
    setOpen(true)
  }, [cancelPendingClose])

  const closeMenu = useCallback(() => {
    cancelPendingClose()
    setOpen(false)
  }, [cancelPendingClose])

  const toggleMenu = useCallback(() => {
    cancelPendingClose()
    setOpen((current) => !current)
  }, [cancelPendingClose])

  useEffect(() => cancelPendingClose, [cancelPendingClose])

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) closeMenu()
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, closeMenu])

  const hoverProps = hover
    ? {
        onMouseEnter: openMenu,
        onMouseLeave: () => {
          cancelPendingClose()
          timerRef.current = setTimeout(() => setOpen(false), closeDelay)
        },
        onFocus: openMenu,
        onBlur: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) closeMenu()
        },
      }
    : {}

  return {
    open,
    openMenu,
    closeMenu,
    toggleMenu,
    containerProps: { ref: containerRef, ...hoverProps },
  }
}

export default useMenu
