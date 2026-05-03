'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useTranslations } from 'next-intl'

import { signupAction, type SignupState } from './actions'

const initialState: SignupState = { error: null, notice: null }

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialState)
  const t = useTranslations('Register')

  return (
    <form action={formAction} className="space-y-4">
      <Field label={t('usernameLabel')} name="username" type="text" autoComplete="username" />
      <Field label={t('emailLabel')} name="email" type="email" autoComplete="email" required />
      <Field
        label={t('passwordLabel')}
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint={t('passwordHint')}
      />

      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-accent-2/30 bg-accent-2-light px-3 py-2 text-sm text-accent-2"
        >
          {state.error}
        </p>
      )}

      {state.notice && (
        <p
          role="status"
          className="rounded-md border border-accent/30 bg-accent-light px-3 py-2 text-sm text-accent"
        >
          {state.notice}
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
  hint,
}: {
  label: string
  name: string
  type: string
  autoComplete?: string
  required?: boolean
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={type === 'password' ? 8 : undefined}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {hint && <span className="mt-1 block text-xs text-text-muted">{hint}</span>}
    </label>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  const t = useTranslations('Register')
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-accent px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? t('submitPending') : t('submitLabel')}
    </button>
  )
}
