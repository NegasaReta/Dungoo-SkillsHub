export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
