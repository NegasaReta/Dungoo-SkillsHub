import { strings } from '../../i18n/en.js'

export default function TranscriptInput({ value, onChange, disabled }) {
  const t = strings.interview

  return (
    <div>
      <label htmlFor="transcript" className="block font-medium text-primary">
        {t.transcriptLabel}
      </label>
      <p className="mt-1 text-sm text-primary/60">{t.transcriptHint}</p>
      <textarea
        id="transcript"
        rows={6}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t.transcriptPlaceholder}
        className="mt-3 w-full rounded-lg border border-primary/20 bg-white p-3 text-primary placeholder:text-primary/40 focus:border-brand-blue focus:outline-none disabled:opacity-60"
      />
    </div>
  )
}
