/**
 * Display data for the language slugs the backend allows, in
 * backend/app/core/constants.py. The server validates the slug and knows nothing
 * about names, so the labels, native spellings, and search aliases live here.
 *
 * Ordered the same way the backend orders them: the ten largest languages of
 * Ethiopia by share of speakers in the 2007 census, then the ten most spoken
 * languages worldwide by first- plus second-language speakers (Ethnologue).
 *
 * A slug that is served but missing here still works — the picker falls back to a
 * humanised version of the slug — so the two lists can drift without breaking.
 */
import { humanize } from '../lib/labels.js'

export const LANGUAGE_GROUPS = {
  ethiopian: 'Ethiopian languages',
  international: 'International languages',
  other: 'Other',
}

const ETHIOPIAN = [
  { value: 'afaan_oromo', label: 'Afaan Oromoo', native: 'Afaan Oromoo', aliases: ['oromo', 'oromiffa'] },
  { value: 'amharic', label: 'Amharic', native: 'አማርኛ', aliases: ['amarigna', 'amharigna'] },
  { value: 'somali', label: 'Somali', native: 'Soomaali' },
  { value: 'tigrinya', label: 'Tigrinya', native: 'ትግርኛ', aliases: ['tigrigna'] },
  { value: 'sidamo', label: 'Sidaamu Afoo', native: 'Sidaamu Afoo', aliases: ['sidama', 'sidamo'] },
  { value: 'wolaytta', label: 'Wolaytta', native: 'Wolaittattuwa', aliases: ['wolayta', 'welayta'] },
  { value: 'gurage', label: 'Gurage', native: 'ጉራጌ', aliases: ['guragigna', 'sebat bet'] },
  { value: 'afar', label: 'Afar', native: 'Qafar af' },
  { value: 'hadiyya', label: 'Hadiyya', native: 'Hadiyyisa' },
  { value: 'gamo', label: 'Gamo', native: 'Gamotstso' },
]

const INTERNATIONAL = [
  { value: 'english', label: 'English', native: 'English' },
  { value: 'mandarin', label: 'Mandarin Chinese', native: '普通话', aliases: ['chinese', 'putonghua'] },
  { value: 'hindi', label: 'Hindi', native: 'हिन्दी' },
  { value: 'spanish', label: 'Spanish', native: 'Español', aliases: ['castellano'] },
  { value: 'arabic', label: 'Arabic', native: 'العربية', aliases: ['modern standard arabic', 'msa'] },
  { value: 'french', label: 'French', native: 'Français' },
  { value: 'bengali', label: 'Bengali', native: 'বাংলা', aliases: ['bangla'] },
  { value: 'portuguese', label: 'Portuguese', native: 'Português' },
  { value: 'indonesian', label: 'Indonesian', native: 'Bahasa Indonesia' },
  { value: 'urdu', label: 'Urdu', native: 'اردو' },
]

const OTHER = [{ value: 'other', label: 'Another language', native: '' }]

export const LANGUAGES = [
  ...ETHIOPIAN.map((entry) => ({ ...entry, group: 'ethiopian' })),
  ...INTERNATIONAL.map((entry) => ({ ...entry, group: 'international' })),
  ...OTHER.map((entry) => ({ ...entry, group: 'other' })),
]

const BY_VALUE = new Map(LANGUAGES.map((entry) => [entry.value, entry]))

/** Never returns null: an unknown slug becomes a readable label of its own. */
export function language(value) {
  return BY_VALUE.get(value) ?? { value, label: humanize(value), native: '', group: 'other' }
}

export function languageLabel(value) {
  return language(value).label
}

/** "Amharic (አማርኛ)", or just the label when the native name adds nothing. */
export function languageFullLabel(value) {
  const entry = language(value)
  return entry.native && entry.native !== entry.label
    ? `${entry.label} (${entry.native})`
    : entry.label
}

function haystack(entry) {
  return [entry.value.replace(/_/g, ' '), entry.label, entry.native, ...(entry.aliases ?? [])]
    .join(' ')
    .toLowerCase()
}

/**
 * Decorates the slugs the server allows with display data, keeps the server's
 * order, and filters by a free-text query across name, native name, and aliases —
 * so "oromo", "oromiffa", and "አማርኛ" all find something.
 */
export function searchLanguages(values, query = '') {
  const entries = values.map(language)
  const needle = query.trim().toLowerCase()
  if (!needle) return entries
  return entries.filter((entry) => haystack(entry).includes(needle))
}

/** Groups entries for display, dropping groups that ended up empty. */
export function groupLanguages(entries) {
  return Object.entries(LANGUAGE_GROUPS)
    .map(([group, title]) => ({
      group,
      title,
      entries: entries.filter((entry) => entry.group === group),
    }))
    .filter((section) => section.entries.length > 0)
}
