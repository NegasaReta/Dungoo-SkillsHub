import { SCORE_MAX } from '../../constants.js'
import Panel from '../dashboard/Panel.jsx'

export default function RoleBreakdown({ roles }) {
  return (
    <Panel className="h-full">
      <h2 className="text-base font-semibold text-primary">By Role</h2>
      <p className="mt-1 text-xs text-primary/60">Where you interview strongest</p>

      {roles.length ? (
        <ul className="mt-5 space-y-4">
          {roles.map((role) => (
            <li key={role.role}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium text-primary">{role.label}</span>
                <span className="shrink-0 font-semibold text-primary">
                  {role.average.toFixed(1)}
                  <span className="font-normal text-primary/50"> / {SCORE_MAX}</span>
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-surface">
                <div
                  className="h-2 rounded-full bg-brand-blue"
                  style={{ width: `${(role.average / SCORE_MAX) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-primary/50">
                {role.sessions} session{role.sessions === 1 ? '' : 's'} · {role.answers} answer
                {role.answers === 1 ? '' : 's'}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-primary/60">
          Practise more than one role to compare where you interview strongest.
        </p>
      )}
    </Panel>
  )
}
