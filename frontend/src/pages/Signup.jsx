import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import AuthCard from '../components/auth/AuthCard.jsx'
import FormAlert from '../components/auth/FormAlert.jsx'
import PasswordChecklist from '../components/auth/PasswordChecklist.jsx'
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter.jsx'
import TextField from '../components/auth/TextField.jsx'
import Button from '../components/common/Button.jsx'
import { useUser } from '../context/UserContext.jsx'
import {
  validateEmail,
  validateEmailConfirmation,
  validatePasswordConfirmation,
  validatePasswordStrength,
  validateRequired,
} from '../lib/validation.js'

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  confirm_email: '',
  password: '',
  confirm_password: '',
}

export default function Signup() {
  const { signup } = useUser()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
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
      first_name: validateRequired(form.first_name, 'First name'),
      last_name: validateRequired(form.last_name, 'Last name'),
      email: validateEmail(form.email),
      confirm_email: validateEmailConfirmation(form.email, form.confirm_email),
      password: validatePasswordStrength(form.password),
      confirm_password: validatePasswordConfirmation(form.password, form.confirm_password),
    }
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    setSubmitting(true)
    try {
      await signup({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Step 1 of 2 — tell us who you are and choose a secure password."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-blue hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormAlert>{formError}</FormAlert>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="first_name"
            label="First name"
            autoComplete="given-name"
            placeholder="Abebe"
            value={form.first_name}
            error={fieldErrors.first_name}
            onChange={(event) => updateField('first_name', event.target.value)}
          />
          <TextField
            id="last_name"
            label="Last name"
            autoComplete="family-name"
            placeholder="Bekele"
            value={form.last_name}
            error={fieldErrors.last_name}
            onChange={(event) => updateField('last_name', event.target.value)}
          />
        </div>

        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          error={fieldErrors.email}
          onChange={(event) => updateField('email', event.target.value)}
        />

        <TextField
          id="confirm_email"
          label="Confirm email"
          type="email"
          autoComplete="email"
          placeholder="Retype your email"
          value={form.confirm_email}
          error={fieldErrors.confirm_email}
          onChange={(event) => updateField('confirm_email', event.target.value)}
        />

        <div>
          <TextField
            id="password"
            label="Password"
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
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.confirm_password}
          error={fieldErrors.confirm_password}
          onChange={(event) => updateField('confirm_password', event.target.value)}
        />

        <Button type="submit" variant="accent" disabled={submitting} className="w-full py-3">
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}
