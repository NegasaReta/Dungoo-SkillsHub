import { useState } from 'react'

import AiAvatar from './AiAvatar.jsx'
import Button from '../common/Button.jsx'
import Card from '../common/Card.jsx'
import RoleSelect from '../onboarding/RoleSelect.jsx'
import { strings } from '../../i18n/en.js'

/**
 * Pre-join screen. Consent is an explicit checkbox rather than something the
 * join button implies, and nothing is captured until it is ticked.
 */
export default function RoomLobby({ roles, role, onRoleChange, onJoin, onCancel }) {
  const t = strings.interview
  const [consented, setConsented] = useState(false)

  return (
    <Card className="mx-auto max-w-xl">
      <div className="flex items-center gap-4">
        <AiAvatar className="h-14 w-14" />
        <div>
          <h1 className="text-xl font-semibold text-primary">{t.lobbyTitle}</h1>
          <p className="text-sm text-primary/60">{t.lobbySubtitle}</p>
        </div>
      </div>

      <p className="mt-5 text-primary/70">{t.lobbyBody}</p>

      <div className="mt-5">
        <RoleSelect roles={roles} value={role} onChange={onRoleChange} />
      </div>

      <ul className="mt-6 space-y-3">
        {t.consentPoints.map((point) => (
          <li key={point} className="flex gap-3 text-sm text-primary/80">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
            {point}
          </li>
        ))}
      </ul>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg bg-surface p-3 text-sm text-primary/80">
        <input
          type="checkbox"
          checked={consented}
          onChange={(event) => setConsented(event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-accent"
        />
        {t.consentCheckbox}
      </label>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button variant="accent" onClick={onJoin} disabled={!consented}>
          {t.joinRoom}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          {t.consentDecline}
        </Button>
      </div>
    </Card>
  )
}
