import { useEffect, useRef, useState } from 'react'

/**
 * Shared behaviour for the topbar dropdowns: opens on click, closes on an
 * outside click or Escape. `trigger` and `children` are render props so each
 * menu can style its own button and panel.
 */
export default function TopbarMenu({ label, width = 'w-72', trigger, children }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className="block"
      >
        {trigger({ open })}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={label}
          className={`absolute right-0 z-40 mt-2 ${width} overflow-hidden rounded-xl border border-primary/10 bg-white shadow-lg`}
        >
          {children({ close })}
        </div>
      )}
    </div>
  )
}
