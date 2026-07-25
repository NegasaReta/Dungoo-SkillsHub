import { Link } from 'react-router-dom'

import { strings } from '../../i18n/en.js'
import NavIcon from './NavIcon.jsx'
import TopbarMenu from './TopbarMenu.jsx'

const s = strings.help

// Every entry points somewhere that exists: `to` for app routes, `href` for the
// landing page anchors, which need a real page load for the browser to scroll.
const LINKS = [
  { icon: 'mic', label: s.practice, body: s.practiceBody, to: '/interview' },
  { icon: 'spark', label: s.passport, body: s.passportBody, to: '/passport' },
  { icon: 'help', label: s.howItWorks, body: s.howItWorksBody, href: '/#how-it-works' },
  { icon: 'settings', label: s.account, body: s.accountBody, to: '/settings' },
]

export default function HelpMenu() {
  return (
    <TopbarMenu
      label={s.title}
      width="w-80"
      trigger={({ open }) => (
        <span
          className={`flex items-center rounded-lg p-2 transition-colors ${
            open ? 'bg-surface text-brand-blue' : 'text-primary/60 hover:text-brand-blue'
          }`}
        >
          <NavIcon name="help" />
        </span>
      )}
    >
      {({ close }) => (
        <>
          <div className="border-b border-primary/10 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-primary">{s.title}</p>
            <p className="mt-0.5 text-xs text-primary/55">{s.intro}</p>
          </div>

          <div className="divide-y divide-primary/10">
            {LINKS.map((link) => {
              const inner = (
                <>
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-primary/60">
                    <NavIcon name={link.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-primary">{link.label}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-primary/60">
                      {link.body}
                    </span>
                  </span>
                </>
              )
              const className =
                'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-surface'

              return link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  role="menuitem"
                  onClick={close}
                  className={className}
                >
                  {inner}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  role="menuitem"
                  onClick={close}
                  className={className}
                >
                  {inner}
                </a>
              )
            })}
          </div>

          <p className="border-t border-primary/10 px-4 py-2.5 text-center text-xs text-primary/50">
            {s.shortcut}
          </p>
        </>
      )}
    </TopbarMenu>
  )
}
