const STATES = {
  disconnected: { label: 'Not connected', dot: 'bg-slate-400' },
  connecting: { label: 'Connecting…', dot: 'bg-amber-500 animate-pulse' },
  connected: { label: 'Live', dot: 'bg-emerald-500' },
  error: { label: 'Connection error', dot: 'bg-red-500' },
}

export default function ConnectionStatus({ status }) {
  const state = STATES[status] ?? STATES.disconnected

  return (
    <span role="status" className="flex items-center gap-2 text-sm text-slate-600">
      <span className={`h-2 w-2 rounded-full ${state.dot}`} />
      {state.label}
    </span>
  )
}
