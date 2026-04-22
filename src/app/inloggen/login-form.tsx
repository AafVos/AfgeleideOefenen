'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { loginAction, type LoginState } from './actions'

const initialState: LoginState = { error: null }

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="E-mailadres"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <Field
        label="Wachtwoord"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-accent-2/30 bg-accent-2-light px-3 py-2 text-sm text-accent-2"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}

function Field({
  label,
  name,
  type,
  autoComplete,
  required,
}: {
  label: string
  name: string
  type: string
  autoComplete?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </label>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-accent px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Bezig met inloggen…' : 'Inloggen'}
    </button>
  )
}
