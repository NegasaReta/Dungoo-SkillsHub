/** Shared surface for every topbar dropdown so they stay visually identical. */
export default function MenuPanel({ children, className = '', ...props }) {
  return (
    <div
      className={`absolute right-0 top-full z-40 mt-2 origin-top-right rounded-2xl border border-primary/10 bg-panel shadow-xl shadow-navy/10 ring-1 ring-primary/5 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
