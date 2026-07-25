import { useState } from 'react'
import { Link } from 'react-router-dom'

import { requestPasswordReset } from '../api/index.js'
import AuthCard from '../components/auth/AuthCard.jsx'
import FormAlert from '../components/auth/FormAlert.jsx'
import TextField from '../components/auth/TextField.jsx'
import Button from '../components/common/Button.jsx'
import { validateEmail } from '../lib/validation.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState(null)
  const [formError, setFormError] = useState('')
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const error = validateEmail(email)
    setFieldError(error)
    if (error) return

    setSubmitting(true)
    try {
      setResult(await requestPasswordReset(email.trim()))
    } catch (requestError) {
      setFormError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the email you signed up with and we'll send you a reset link."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-brand-blue hover:underline">
            Back to log in
          </Link>
        </>
      }
    >
      {result ? (
        <div className="space-y-5">
          <FormAlert tone="success">{result.message}</FormAlert>

          {/* Only present while the server runs with DEV_EXPOSE_RESET_TOKEN on,
              which stands in for an email provider during development. */}
          {result.reset_token && (
            <div className="rounded-lg border border-accent/40 bg-accent/10 p-4">
              <p className="text-sm font-medium text-primary">
                Development mode: no email was sent.
              </p>
              <p className="mt-1 text-xs text-primary/60">
                The server returned the reset link directly. This does not happen once real
                email delivery is configured.
              </p>
              <Link
                to={`/reset-password?token=${encodeURIComponent(result.reset_token)}`}
                className="mt-3 inline-block text-sm font-medium text-brand-blue hover:underline"
              >
                Continue to set a new password
              </Link>
            </div>
          )}

          <Link
            to="/login"
            className="block text-center text-sm text-primary/60 transition-colors hover:text-primary"
          >
            Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormAlert>{formError}</FormAlert>

          <TextField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            error={fieldError}
            onChange={(event) => {
              setEmail(event.target.value)
              setFieldError(null)
            }}
          />

          <Button type="submit" variant="accent" disabled={submitting} className="w-full py-3">
            {submitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
