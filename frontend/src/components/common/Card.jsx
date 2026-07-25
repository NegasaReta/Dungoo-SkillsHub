export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-primary/10 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  )
}
