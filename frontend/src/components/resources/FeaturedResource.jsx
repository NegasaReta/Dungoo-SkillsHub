import { FORMATS } from '../../data/resources.js'
import { format, strings } from '../../i18n/en.js'
import NavIcon from '../app/NavIcon.jsx'

export default function FeaturedResource({ resource, onOpen }) {
  if (!resource) return null

  return (
    // Navy rather than primary: primary inverts in dark mode, which would put white
    // text on a near-white card.
    <section className="flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-navy p-6 text-white shadow-sm">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
            <NavIcon name="spark" className="h-3.5 w-3.5" />
            {strings.resources.featured}
          </span>
          <span className="text-[11px] text-white/60">
            {format(strings.resources.minutesRead, { minutes: resource.minutes })} ·{' '}
            {FORMATS[resource.format].label}
          </span>
        </div>

        <h2 className="mt-5 max-w-lg text-3xl font-bold leading-tight">{resource.title}</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">{resource.summary}</p>
      </div>

      <button
        type="button"
        onClick={() => onOpen(resource)}
        className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
      >
        {strings.resources.startReading}
        <NavIcon name="arrow" className="h-4 w-4" />
      </button>
    </section>
  )
}
