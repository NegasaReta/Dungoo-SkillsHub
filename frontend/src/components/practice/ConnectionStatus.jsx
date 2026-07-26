const STATES = {
  disconnected: { label: 'Not connected', dot: 'bg-primary/30', text: 'text-primary/60' },
  connecting: { label: 'Connecting…', dot: 'bg-warning animate-pulse', text: 'text-warning' },
  connected: { label: 'Live', dot: 'bg-success', text: 'text-success' },
  error: { label: 'Connection error', dot: 'bg-danger', text: 'text-danger' },
}

export default function ConnectionStatus({ status }) {
  const state = STATES[status] ?? STATES.disconnected

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 rounded-full border border-primary/10 bg-surface px-3 py-1 text-xs font-medium ${state.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${state.dot}`} />
      {state.label}
    </span>
  )
}
