import Button from '../common/Button.jsx'
import Card from '../common/Card.jsx'
import { strings } from '../../i18n/en.js'

export default function ConsentGate({ onAccept, onDecline }) {
  const t = strings.interview

  return (
    <Card className="mx-auto max-w-xl">
      <h2 className="text-xl font-semibold text-primary">{t.consentTitle}</h2>
      <p className="mt-3 text-primary/70">{t.consentBody}</p>

      <ul className="mt-5 space-y-3">
        {t.consentPoints.map((point) => (
          <li key={point} className="flex gap-3 text-sm text-primary/80">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
            {point}
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button variant="accent" onClick={onAccept}>
          {t.consentAccept}
        </Button>
        <Button variant="outline" onClick={onDecline}>
          {t.consentDecline}
        </Button>
      </div>
    </Card>
  )
}
