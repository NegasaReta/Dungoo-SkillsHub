import {
  EXCHANGE_LANGUAGES,
  MATCHING_INDUSTRIES,
  SKILL_LEVELS,
} from '../../data/matching.js'
import { humanize } from '../../lib/labels.js'
import NavIcon from '../app/NavIcon.jsx'
import Panel from '../dashboard/Panel.jsx'

function LanguagePicker({ id, title, hint, selected, onToggle }) {
  return (
    <Panel>
      <h2 className="text-sm font-semibold text-primary">{title}</h2>
      <p className="mt-0.5 text-xs text-primary/50">{hint}</p>
      <ul className="mt-3 space-y-2">
        {EXCHANGE_LANGUAGES.map((language) => (
          <li key={language}>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-primary/80">
              <input
                type="checkbox"
                name={`${id}-${language}`}
                className="h-4 w-4 accent-brand-blue"
                checked={selected.includes(language)}
                onChange={() => onToggle(language)}
              />
              {humanize(language)}
            </label>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export default function MatchFilters({ filters, onChange }) {
  const toggle = (field) => (language) => {
    const current = filters[field]
    onChange({
      ...filters,
      [field]: current.includes(language)
        ? current.filter((item) => item !== language)
        : [...current, language],
    })
  }

  return (
    <aside className="space-y-4">
      <LanguagePicker
        id="speaks"
        title="You speak"
        hint="What you can offer a partner"
        selected={filters.speaks}
        onToggle={toggle('speaks')}
      />

      <LanguagePicker
        id="wants"
        title="You want to practise"
        hint="What you are looking for"
        selected={filters.wants}
        onToggle={toggle('wants')}
      />

      <Panel>
        <label htmlFor="industry-focus" className="text-sm font-semibold text-primary">
          Industry focus
        </label>
        <select
          id="industry-focus"
          value={filters.industry}
          onChange={(event) => onChange({ ...filters, industry: event.target.value })}
          className="mt-3 w-full rounded-lg border border-primary/15 bg-surface px-3 py-2.5 text-sm text-primary outline-none focus:border-brand-blue"
        >
          {MATCHING_INDUSTRIES.map((industry) => (
            <option key={industry.id} value={industry.id}>
              {industry.label}
            </option>
          ))}
        </select>
      </Panel>

      <Panel>
        <h2 className="text-sm font-semibold text-primary">Partner level</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {['any', ...SKILL_LEVELS].map((level) => {
            const active = filters.level === level
            return (
              <button
                key={level}
                type="button"
                onClick={() => onChange({ ...filters, level })}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-brand-blue text-white'
                    : 'border border-primary/15 text-primary/70 hover:border-brand-blue/40'
                }`}
              >
                {level === 'any' ? 'Any' : level}
              </button>
            )
          })}
        </div>
      </Panel>

      <Panel>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-primary">Online now</p>
            <p className="mt-0.5 text-xs text-primary/50">Only show available partners</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={filters.onlineOnly}
            aria-label="Only show partners who are online"
            onClick={() => onChange({ ...filters, onlineOnly: !filters.onlineOnly })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              filters.onlineOnly ? 'bg-success' : 'bg-primary/20'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-panel shadow transition-transform ${
                filters.onlineOnly ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </Panel>

      <Panel className="bg-brand-blue/5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/15 text-link">
            <NavIcon name="spark" className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-primary">How pairing works</p>
            <p className="mt-1 text-xs leading-relaxed text-primary/60">
              A mutual match speaks a language you want to practise and wants one you already
              speak. Sessions are free for 40 minutes a day.
            </p>
          </div>
        </div>
      </Panel>
    </aside>
  )
}
