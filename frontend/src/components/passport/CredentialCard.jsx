import { Link } from 'react-router-dom'

import { SCORE_MAX } from '../../constants.js'
import { format, strings } from '../../i18n/en.js'
import { formatDate } from '../../lib/dates.js'
import { formatScore } from '../../lib/scores.js'

/** The credential itself: who it belongs to, what for, and how they are doing. */
export default function CredentialCard({ passport }) {
  const t = strings.passport
  const level = t.levels[passport.level] ?? t.notScored

  return (
    <section className="overflow-hidden rounded-3xl bg-primary text-white shadow-lg">
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
            {t.title}
          </p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            {passport.holder_name || (
              <Link
                to="/complete-profile"
                className="underline decoration-white/40 decoration-dashed underline-offset-4 hover:decoration-accent"
              >
                {t.holderUnknown}
              </Link>
            )}
          </h2>
          <p className="mt-1.5 text-sm text-white/60">
            {t.roleLabel} <span className="font-medium text-white/90">{passport.role_label}</span>
          </p>
        </div>

        <div className="shrink-0 sm:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50">
            {t.overallLabel}
          </p>
          <p className="mt-1 flex items-baseline gap-1 sm:justify-end">
            <span className="text-4xl font-bold text-accent sm:text-5xl">
              {formatScore(passport.overall)}
            </span>
            <span className="text-sm text-white/50">/ {SCORE_MAX}</span>
          </p>
          <p className="mt-2">
            <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
              {level}
            </span>
          </p>
        </div>
      </div>

      <p className="px-6 pb-6 text-sm text-white/70 sm:px-8">{t.levelHints[passport.level]}</p>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 bg-white/5 px-6 py-4 text-xs text-white/60 sm:px-8">
        <span>{format(t.sessions, { count: passport.sessions_completed })}</span>
        <span>{format(t.answers, { count: passport.answers_scored })}</span>
        {passport.updated_at && (
          <span>{format(t.updated, { date: formatDate(passport.updated_at) })}</span>
        )}
        <span className="font-medium text-accent sm:ml-auto">{t.verified}</span>
      </div>
    </section>
  )
}
