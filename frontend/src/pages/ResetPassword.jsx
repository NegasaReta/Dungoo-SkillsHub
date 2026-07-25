import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { resetPassword } from '../api/index.js'
import AuthCard from '../components/auth/AuthCard.jsx'
import FormAlert from '../components/auth/FormAlert.jsx'
import PasswordChecklist from '../components/auth/PasswordChecklist.jsx'
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter.jsx'
import TextField from '../components/auth/TextField.jsx'
import Button from '../components/common/Button.jsx'
import { validatePasswordConfirmation, validatePasswordStrength } from '../lib/validation.js'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const [form, setForm] = useState({ password: '', confirm_password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: null }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const errors = {
      password: validatePasswordStrength(form.password),
      confirm_password: validatePasswordConfirmation(form.password, form.confirm_password),
    }
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    setSubmitting(true)
    try {
      await resetPassword(token, form.password)
      navigate('/login', {
        replace: true,
        state: { notice: 'Your password has been reset. Log in with your new password.' },
      })
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <AuthCard
        title="Reset link incomplete"
        subtitle="This page needs the token from your reset email."
      >
        <div className="space-y-5">
          <FormAlert>
            No reset token was found in the address. Open the link from your email, or request a
            new one.
          </FormAlert>
          <Link
            to="/forgot-password"
            className="block text-center text-sm font-medium text-brand-blue hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Choose a new password" subtitle="Pick something you have not used before.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormAlert>{formError}</FormAlert>

        <div>
          <TextField
            id="password"
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.password}
            error={fieldErrors.password}
            onChange={(event) => updateField('password', event.target.value)}
          />
          <PasswordStrengthMeter value={form.password} />
          <PasswordChecklist value={form.password} />
        </div>

        <TextField
          id="confirm_password"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.confirm_password}
          error={fieldErrors.confirm_password}
          onChange={(event) => updateField('confirm_password', event.target.value)}
        />

        <Button type="submit" variant="accent" disabled={submitting} className="w-full py-3">
          {submitting ? 'Saving…' : 'Set new password'}
        </Button>
      </form>
    </AuthCard>
  )
}
