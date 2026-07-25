export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-primary/10 bg-panel p-4 shadow-sm ${className}`}>
      {children}
    </div>
  )
}
