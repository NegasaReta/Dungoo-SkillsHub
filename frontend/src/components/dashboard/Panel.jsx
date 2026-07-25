export default function Panel({ children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-primary/10 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  )
}
