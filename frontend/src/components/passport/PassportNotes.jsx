import { strings } from '../../i18n/en.js'
import Panel from '../dashboard/Panel.jsx'

function NoteList({ title, notes, dotClassName, emptyLabel }) {
  return (
    <Panel className="h-full">
      <h3 className="text-base font-semibold text-primary">{title}</h3>
      {notes.length ? (
        <ul className="mt-4 space-y-3">
          {notes.map((note) => (
            <li key={note} className="flex gap-3 text-sm leading-relaxed text-primary/75">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClassName}`} />
              {note}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-primary/50">{emptyLabel}</p>
      )}
    </Panel>
  )
}

/** What the scorer praised and what it asked for next, straight from the reports. */
export default function PassportNotes({ strengths = [], focusAreas = [] }) {
  const t = strings.passport

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <NoteList
        title={t.strengthsTitle}
        notes={strengths}
        dotClassName="bg-success"
        emptyLabel={t.notesEmpty}
      />
      <NoteList
        title={t.focusTitle}
        notes={focusAreas}
        dotClassName="bg-accent"
        emptyLabel={t.notesEmpty}
      />
    </div>
  )
}
