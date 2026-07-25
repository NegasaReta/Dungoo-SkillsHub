import { useEffect, useMemo, useState } from 'react'

import { completeProfile, fetchOptions } from '../../api/index.js'
import { useUser } from '../../context/UserContext.jsx'
import { DEFAULT_OPTIONS, normalizeOptions } from '../../lib/options.js'
import { validatePhone, validateRequired } from '../../lib/validation.js'
import CheckboxGrid from '../auth/CheckboxGrid.jsx'
import FormAlert from '../auth/FormAlert.jsx'
import SelectField from '../auth/SelectField.jsx'
import TextField from '../auth/TextField.jsx'
import Loader from '../common/Loader.jsx'

function formFromUser(user) {
  return {
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    education_level: user?.education_level ?? '',
    industries: user?.industries ?? [],
    phone_number: user?.phone_number ?? '',
    languages: user?.languages ?? [],
  }
}

/**
 * Shared by the onboarding step and the settings page. Both edit exactly the
 * same profile, so they differ only in chrome: whether names are editable,
 * button wording, and what happens after a successful save.
 */
export default function ProfileForm({
  includeName = false,
  submitLabel = 'Save',
  successMessage = '',
  showReset = false,
  secondaryAction = null,
  onSaved,
}) {
  const { user, refresh } = useUser()

  const initialForm = useMemo(() => formFromUser(user), [user])
  const [form, setForm] = useState(initialForm)
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [optionsWarning, setOptionsWarning] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetchOptions()
      .then((payload) => {
        if (cancelled) return
        const { options: normalized, missing } = normalizeOptions(payload)
        setOptions(normalized)
        if (missing.length) {
          setOptionsWarning(
            `The server did not return options for: ${missing.join(', ')}. Showing built-in defaults.`
          )
        }
      })
      .catch(() => {
        if (cancelled) return
        setOptions(DEFAULT_OPTIONS)
        setOptionsWarning(
          'Could not load the option lists from the server, so built-in defaults are shown. Your answers may be rejected on save.'
        )
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const dirty = JSON.stringify(form) !== JSON.stringify(initialForm)

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: null }))
    setSaved(false)
  }

  function toggleMulti(name, value) {
    setForm((current) => {
      const selected = current[name]
      return {
        ...current,
        [name]: selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value],
      }
    })
    setFieldErrors((current) => ({ ...current, [name]: null }))
    setSaved(false)
  }

  function reset() {
    setForm(initialForm)
    setFieldErrors({})
    setFormError('')
    setSaved(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    setSaved(false)

    const errors = {
      education_level: form.education_level ? null : 'Select your education level.',
      industries: form.industries.length ? null : 'Select at least one industry.',
      phone_number: validatePhone(form.phone_number),
      languages: form.languages.length ? null : 'Select at least one language.',
    }
    if (includeName) {
      errors.first_name = validateRequired(form.first_name, 'First name')
      errors.last_name = validateRequired(form.last_name, 'Last name')
    }

    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    const payload = {
      education_level: form.education_level,
      industries: form.industries,
      phone_number: form.phone_number.trim(),
      languages: form.languages,
    }
    if (includeName) {
      payload.first_name = form.first_name.trim()
      payload.last_name = form.last_name.trim()
    }

    setSubmitting(true)
    try {
      await completeProfile(payload)
      await refresh()
      setSaved(true)
      onSaved?.()
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingOptions) return <Loader label="Loading options…" />

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <FormAlert tone="warning">{optionsWarning}</FormAlert>
      <FormAlert>{formError}</FormAlert>
      {saved && successMessage && <FormAlert tone="success">{successMessage}</FormAlert>}

      {includeName && (
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="first_name"
            label="First name"
            autoComplete="given-name"
            value={form.first_name}
            error={fieldErrors.first_name}
            onChange={(event) => updateField('first_name', event.target.value)}
          />
          <TextField
            id="last_name"
            label="Last name"
            autoComplete="family-name"
            value={form.last_name}
            error={fieldErrors.last_name}
            onChange={(event) => updateField('last_name', event.target.value)}
          />
        </div>
      )}

      <SelectField
        id="education_level"
        label="Education level"
        options={options.educationLevels}
        value={form.education_level}
        error={fieldErrors.education_level}
        onChange={(event) => updateField('education_level', event.target.value)}
      />

      <TextField
        id="phone_number"
        label="Phone number"
        type="tel"
        autoComplete="tel"
        placeholder="+251912345678"
        value={form.phone_number}
        error={fieldErrors.phone_number}
        onChange={(event) => updateField('phone_number', event.target.value)}
      />

      <CheckboxGrid
        legend="Industries of interest"
        hint="Choose at least one."
        options={options.industries}
        selected={form.industries}
        error={fieldErrors.industries}
        onToggle={(value) => toggleMulti('industries', value)}
      />

      <CheckboxGrid
        legend="Languages you speak"
        hint="Choose at least one."
        options={options.languages}
        selected={form.languages}
        error={fieldErrors.languages}
        onToggle={(value) => toggleMulti('languages', value)}
      />

      <div className="flex flex-wrap items-center gap-3 border-t border-primary/10 pt-5">
        <button
          type="submit"
          disabled={submitting || (showReset && !dirty)}
          className="rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>

        {showReset && dirty && (
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-primary/15 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
          >
            Cancel
          </button>
        )}

        {secondaryAction}
      </div>
    </form>
  )
}
