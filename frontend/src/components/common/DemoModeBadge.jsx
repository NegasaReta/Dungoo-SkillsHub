import { usingMockApi } from '../../api/index.js'

export default function DemoModeBadge() {
  if (!usingMockApi) return null

  return (
    <div className="pointer-events-none fixed bottom-3 left-1/2 z-50 -translate-x-1/2">
      <span className="rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-medium text-primary shadow-sm">
        Demo mode — accounts are saved in this browser only
      </span>
    </div>
  )
}
