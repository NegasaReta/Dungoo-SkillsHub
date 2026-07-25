import { TOPICS } from '../../data/resources.js'
import { strings } from '../../i18n/en.js'

export default function TopicTabs({ topic, onChange, counts }) {
  return (
    <div
      role="group"
      aria-label={strings.resources.topicsLabel}
      className="flex flex-wrap items-center gap-2"
    >
      {TOPICS.map(({ slug, label }) => {
        const active = topic === slug
        const count = counts[slug] ?? 0

        return (
          <button
            key={slug}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(slug)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
              active
                ? 'bg-brand-blue text-white'
                : 'border border-primary/15 bg-panel text-primary/70 hover:text-primary'
            }`}
          >
            {label}
            <span className={active ? 'text-white/70' : 'text-primary/40'}>{count}</span>
          </button>
        )
      })}
    </div>
  )
}
