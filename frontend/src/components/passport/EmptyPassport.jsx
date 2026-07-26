import { Link } from 'react-router-dom'

import { strings } from '../../i18n/en.js'
import Button from '../common/Button.jsx'
import Panel from '../dashboard/Panel.jsx'

/** Shown until the first interview is scored: a blank credential would read as a fault. */
export default function EmptyPassport() {
  const t = strings.passport

  return (
    <Panel className="text-center">
      <div className="mx-auto max-w-md py-8">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-2xl font-bold text-brand-blue">
          D
        </span>
        <h2 className="mt-5 text-xl font-semibold text-primary">{t.emptyTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-primary/60">{t.emptyBody}</p>
        <Button as={Link} to="/interview" variant="accent" className="mt-6">
          {t.emptyAction}
        </Button>
      </div>
    </Panel>
  )
}
