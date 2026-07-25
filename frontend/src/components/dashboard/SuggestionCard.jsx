import NavIcon from '../app/NavIcon.jsx'
import Panel from './Panel.jsx'

const AVATAR_TONES = ['bg-brand-blue', 'bg-accent text-primary']

export default function SuggestionCard({ title, description, participants }) {
  return (
    <Panel className="h-full">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-2.5 py-1 text-[11px] font-medium text-brand-blue">
          <NavIcon name="spark" className="h-3.5 w-3.5" />
          AI Suggestion
        </span>
        <button
          type="button"
          aria-label="Suggestion options"
          className="rounded-md p-1 text-primary/40 transition-colors hover:text-primary"
        >
          <NavIcon name="dots" className="h-4 w-4" />
        </button>
      </div>

      <h2 className="mt-3 text-base font-semibold text-primary">{title}</h2>
      <p className="mt-1.5 text-xs leading-relaxed text-primary/60">{description}</p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {participants.map((initials, index) => (
            <span
              key={initials}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white ${
                AVATAR_TONES[index % AVATAR_TONES.length]
              }`}
            >
              {initials}
            </span>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-blue transition-colors hover:text-primary"
        >
          Start Session
          <NavIcon name="arrow" className="h-4 w-4" />
        </button>
      </div>
    </Panel>
  )
}
