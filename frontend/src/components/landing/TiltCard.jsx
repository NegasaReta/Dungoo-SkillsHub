import useTilt from '../../hooks/useTilt.js'

/**
 * Card that leans toward the pointer in 3D. `as` keeps the underlying element
 * semantic (article, li, …) while the wrapper owns the perspective.
 */
export default function TiltCard({
  children,
  as: Component = 'div',
  className = '',
  max = 7,
  lift = true,
}) {
  const { ref, tiltProps, enabled } = useTilt({ max })

  return (
    <div ref={ref} {...tiltProps} className="scene-3d">
      <Component
        className={`tilt-3d h-full ${
          enabled && lift ? 'hover:-translate-y-1' : ''
        } ${className}`}
      >
        {children}
      </Component>
    </div>
  )
}
