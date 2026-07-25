import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import AuthCard from '../components/auth/AuthCard.jsx'
import FormAlert from '../components/auth/FormAlert.jsx'
import TextField from '../components/auth/TextField.jsx'
import Button from '../components/common/Button.jsx'
import { useUser } from '../context/UserContext.jsx'
import { validateEmail } from '../lib/validation.js'

export default function Login() {
  const { login } = useUser()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
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

    // No strength rules on login: an existing password only has to be correct.
    const errors = {
      email: validateEmail(form.email),
      password: form.password ? null : 'Password is required.',
    }
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    setSubmitting(true)
    try {
      await login(form.email.trim(), form.password)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to continue building your Skill Passport."
      footer={
        <>
          New to Dungoo SkillsHub?{' '}
          <Link to="/signup" className="font-medium text-link hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormAlert>{formError}</FormAlert>

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
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          error={fieldErrors.password}
          onChange={(event) => updateField('password', event.target.value)}
        />

        <Button type="submit" variant="accent" disabled={submitting} className="w-full py-3">
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthCard>
  )
}
