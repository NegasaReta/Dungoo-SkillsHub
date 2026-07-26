import { useState } from 'react'

import { changePassword } from '../../api/index.js'
import {
  validatePasswordConfirmation,
  validatePasswordStrength,
  validateRequired,
} from '../../lib/validation.js'
import FormAlert from '../auth/FormAlert.jsx'
import PasswordChecklist from '../auth/PasswordChecklist.jsx'
import PasswordStrengthMeter from '../auth/PasswordStrengthMeter.jsx'
import TextField from '../auth/TextField.jsx'

const EMPTY_FORM = { current_password: '', new_password: '', confirm_password: '' }

/**
 * Password change for someone who is already signed in, which is why it asks for
 * the current password: knowing it is what authorises the change on a device that
 * may have been left unlocked. People who cannot log in use the reset link instead.
 */
export default function ChangePasswordForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: null }))
    setFormError('')
    setSaved(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    setSaved(false)

    const errors = {
      current_password: validateRequired(form.current_password, 'Current password'),
      new_password:
        validatePasswordStrength(form.new_password) ||
        (form.new_password === form.current_password
          ? 'Choose a password you have not used here before.'
          : null),
      confirm_password: validatePasswordConfirmation(form.new_password, form.confirm_password),
    }
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    setSubmitting(true)
    try {
      await changePassword(form.current_password, form.new_password)
      setForm(EMPTY_FORM)
      setSaved(true)
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormAlert>{formError}</FormAlert>
      {saved && (
        <FormAlert tone="success">
          Your password has been changed. Use the new one next time you sign in.
        </FormAlert>
      )}

      <TextField
        id="current_password"
        label="Current password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={form.current_password}
        error={fieldErrors.current_password}
        onChange={(event) => updateField('current_password', event.target.value)}
      />

      <div>
        <TextField
          id="new_password"
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.new_password}
          error={fieldErrors.new_password}
          onChange={(event) => updateField('new_password', event.target.value)}
        />
        <PasswordStrengthMeter value={form.new_password} />
        <PasswordChecklist value={form.new_password} />
      </div>

      <TextField
        id="confirm_new_password"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        value={form.confirm_password}
        error={fieldErrors.confirm_password}
        onChange={(event) => updateField('confirm_password', event.target.value)}
      />

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Changing…' : 'Change password'}
      </button>
    </form>
  )
}
