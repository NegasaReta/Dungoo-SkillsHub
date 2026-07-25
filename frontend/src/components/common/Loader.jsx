export default function Loader({ label = 'Loading…' }) {
  return (
    <div role="status" className="flex items-center gap-2 text-primary/60">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      <span>{label}</span>
    </div>
  )
}
