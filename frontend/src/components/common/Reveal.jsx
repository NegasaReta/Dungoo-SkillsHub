import useReveal from '../../hooks/useReveal.js'

/**
 * Fades and lifts its children into place the first time they scroll into view.
 * `delay` staggers siblings; keep it under ~400ms so a fast scroll never leaves
 * the reader waiting on content.
 */
export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  className = '',
  children,
  ...rest
}) {
  const ref = useReveal()

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}
