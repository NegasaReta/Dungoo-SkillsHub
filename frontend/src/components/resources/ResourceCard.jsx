import { Link } from 'react-router-dom'

import { FORMATS } from '../../data/resources.js'
import { format, strings } from '../../i18n/en.js'
import NavIcon from '../app/NavIcon.jsx'
import Panel from '../dashboard/Panel.jsx'

export default function ResourceCard({ resource, onOpen }) {
  const meta = FORMATS[resource.format]
  const isDrill = resource.format === 'drill'
  const isVideo = resource.format === 'video'

  return (
    <Panel className="flex h-full flex-col">
      {isVideo && (
        <button
          type="button"
          onClick={() => onOpen(resource)}
          aria-label={`${strings.resources.watch}: ${resource.title}`}
          className="group relative -mx-5 -mt-5 mb-4 aspect-video overflow-hidden rounded-t-2xl bg-primary/10"
        >
          {/* Thumbnail only — the player itself is not loaded until the resource opens. */}
          <img
            src={`https://i.ytimg.com/vi/${resource.videoId}/mqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-primary/25">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-brand-blue shadow-md">
              <NavIcon name="play" className="h-5 w-5" />
            </span>
          </span>
        </button>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-blue">
          <NavIcon name={meta.icon} className="h-3.5 w-3.5" />
          {meta.label}
        </span>
        <span className="text-[11px] text-primary/45">{resource.level}</span>
      </div>

      <h3 className="mt-3 text-base font-semibold leading-snug text-primary">{resource.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-primary/60">{resource.summary}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-primary/45">
          <NavIcon name={isVideo ? 'play' : 'clock'} className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {isVideo
              ? format(strings.resources.videoBy, { channel: resource.channel })
              : format(
                  isDrill ? strings.resources.minutesPractice : strings.resources.minutesRead,
                  { minutes: resource.minutes }
                )}
          </span>
        </span>

        <div className="flex shrink-0 items-center gap-2">
          {isDrill && resource.action && (
            <Link
              to={resource.action.to}
              className="rounded-lg bg-brand-blue px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-blue/90"
            >
              {resource.action.label}
            </Link>
          )}
          <button
            type="button"
            onClick={() => onOpen(resource)}
            className="rounded-lg border border-primary/15 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-surface"
          >
            {isVideo ? strings.resources.watch : strings.resources.read}
          </button>
        </div>
      </div>
    </Panel>
  )
}
