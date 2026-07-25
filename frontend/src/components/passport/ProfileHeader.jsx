import { useAvatar } from '../../context/AvatarContext.jsx'
import useTilt from '../../hooks/useTilt.js'
import NavIcon from '../app/NavIcon.jsx'
import { initialsFor } from '../common/Avatar.jsx'

/**
 * The credential itself. Deliberately the only navy surface on the page: it
 * should read as a physical card the holder owns rather than another panel, and
 * it mirrors the passport shown on the landing page so the promise matches the
 * product. Navy keeps white text at ~17:1 in both themes.
 */
export default function ProfileHeader({ user, passport }) {
  const { avatar } = useAvatar()
  const { ref, tiltProps } = useTilt({ max: 6 })
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Your Name'

  return (
    <div ref={ref} {...tiltProps} className="scene-3d h-full">
      <div className="tilt-3d relative h-full">
        <div
          aria-hidden="true"
          className="holo-edge pointer-events-none absolute -inset-[2px] rounded-[1.15rem] opacity-60 blur-[2px]"
        />

        <section className="sheen relative h-full overflow-hidden rounded-2xl border border-white/10 bg-navy p-5 text-white shadow-xl shadow-navy/25">
          <div
            aria-hidden="true"
            className="orb orb-accent pointer-events-none absolute -right-16 -top-20 h-56 w-56"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row">
            <div className="shrink-0 text-center sm:text-left">
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  className="depth-1 mx-auto h-24 w-24 rounded-2xl object-cover ring-1 ring-white/20 sm:mx-0"
                />
              ) : (
                <span className="depth-1 mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-blue text-2xl font-bold text-white ring-1 ring-white/20 sm:mx-0">
                  {initialsFor(user)}
                </span>
              )}
              <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-white/50">
                Passport ID
              </p>
              <p className="font-mono text-xs text-white/75">{passport.passportId}</p>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold">{fullName}</h2>
              <p className="mt-1 text-sm font-medium text-accent">{passport.role}</p>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/50">
                    <NavIcon name="location" className="h-3.5 w-3.5" />
                    Target industry
                  </dt>
                  <dd className="mt-1 text-sm">{passport.target}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/50">
                    <NavIcon name="language" className="h-3.5 w-3.5" />
                    Languages
                  </dt>
                  <dd className="mt-1 text-sm">{passport.languages}</dd>
                </div>
              </dl>

              <p className="mt-4 text-sm leading-relaxed text-white/70">{passport.summary}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {passport.verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success ring-1 ring-success/30">
                    <NavIcon name="verified" className="h-3.5 w-3.5" />
                    Scored by Dungoo AI
                  </span>
                )}
                <span className="depth-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-navy shadow-lg shadow-accent/30">
                  <NavIcon name="trophy" className="h-3.5 w-3.5" />
                  {passport.tier}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
