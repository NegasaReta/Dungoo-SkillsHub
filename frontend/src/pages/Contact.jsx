import { Link } from 'react-router-dom'

import NavIcon from '../components/app/NavIcon.jsx'
import SocialIcon from '../components/common/SocialIcon.jsx'
import InfoPage from '../components/landing/InfoPage.jsx'
import { strings } from '../i18n/en.js'

const CHANNELS = {
  support: { icon: 'message', email: (t) => t.supportEmail },
  privacy: { icon: 'verified', email: (t) => t.privacyEmail },
}

export default function Contact() {
  const t = strings.pages.contact
  const shared = strings.pages

  return (
    <InfoPage eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
      <div className="grid gap-4 sm:grid-cols-2">
        {t.channels.map((channel) => {
          const { icon, email } = CHANNELS[channel.kind]
          const address = email(shared)

          return (
            <div
              key={channel.kind}
              className="rounded-2xl border border-primary/10 bg-panel p-6 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-link">
                <NavIcon name={icon} />
              </span>
              <h2 className="mt-4 font-semibold text-primary">{channel.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-primary/65">{channel.body}</p>
              <a
                href={`mailto:${address}`}
                className="mt-4 inline-block break-all text-sm font-medium text-link underline-offset-4 hover:underline"
              >
                {address}
              </a>
            </div>
          )
        })}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-canvas p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <NavIcon name="location" />
          </span>
          <div>
            <h2 className="font-semibold text-primary">{t.locationTitle}</h2>
            <p className="mt-1 text-sm text-primary/65">{t.location}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-canvas p-6">
          <h2 className="font-semibold text-primary">{strings.social.title}</h2>
          <ul className="mt-3 space-y-2">
            <li>
              <a
                href={strings.site.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center gap-3 text-sm text-primary/70 transition-colors hover:text-link"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-link transition-colors group-hover:bg-brand-blue group-hover:text-white">
                  <NavIcon name="globe" className="h-4 w-4" />
                </span>
                <span className="font-medium text-primary">{strings.site.label}</span>
              </a>
            </li>
            {strings.social.links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-center gap-3 text-sm text-primary/70 transition-colors hover:text-link"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-link transition-colors group-hover:bg-brand-blue group-hover:text-white">
                    <SocialIcon name={link.id} />
                  </span>
                  <span>
                    <span className="font-medium text-primary">{link.label}</span>
                    <span className="ml-2 text-primary/55">{link.handle}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-gradient-to-br from-brand-blue to-navy p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="font-semibold text-white">{t.ctaTitle}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-white/70">{t.ctaBody}</p>
        </div>
        <Link
          to="/signup"
          className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:mt-0"
        >
          <NavIcon name="arrow" className="h-4 w-4" />
          {t.ctaAction}
        </Link>
      </div>
    </InfoPage>
  )
}
