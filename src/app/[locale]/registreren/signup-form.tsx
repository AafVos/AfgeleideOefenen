'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { signupAction, type SignupState } from './actions'

const initialState: SignupState = { error: null, notice: null }

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialState)
  const t = useTranslations('Register')
  const [showPassword, setShowPassword] = useState(false)

  if (state.notice) {
    return (
      <div className="space-y-4">
        <p
          role="status"
          className="rounded-md border border-accent/30 bg-accent-light px-3 py-2 text-sm text-accent"
        >
          {state.notice}
        </p>
        <Link
          href="/inloggen"
          className="block w-full rounded-md bg-accent px-4 py-2.5 text-center font-medium text-white shadow-sm transition hover:bg-accent/90"
        >
          {t('toLoginLabel')}
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label={t('usernameLabel')}
        name="username"
        type="text"
        autoComplete="username"
        defaultValue={state.values?.username}
      />
      <Field
        label={t('emailLabel')}
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
      />
      <PasswordField
        label={t('passwordLabel')}
        name="password"
        autoComplete="new-password"
        required
        hint={t('passwordHint')}
        showPassword={showPassword}
        onToggle={() => setShowPassword((prev) => !prev)}
        toggleLabel={showPassword ? t('hidePassword') : t('showPassword')}
      />
      <PasswordField
        label={t('passwordConfirmLabel')}
        name="passwordConfirm"
        autoComplete="new-password"
        required
        showPassword={showPassword}
        onToggle={() => setShowPassword((prev) => !prev)}
        toggleLabel={showPassword ? t('hidePassword') : t('showPassword')}
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

      <p className="pt-1 text-center text-sm text-text-muted">
        {t('hasAccount')}{' '}
        <Link href="/inloggen" className="font-medium text-accent hover:underline">
          {t('loginLink')}
        </Link>
      </p>
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
  defaultValue,
}: {
  label: string
  name: string
  type: string
  autoComplete?: string
  required?: boolean
  hint?: string
  defaultValue?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        minLength={type === 'password' ? 8 : undefined}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {hint && <span className="mt-1 block text-xs text-text-muted">{hint}</span>}
    </label>
  )
}

function PasswordField({
  label,
  name,
  autoComplete,
  required,
  hint,
  showPassword,
  onToggle,
  toggleLabel,
}: {
  label: string
  name: string
  autoComplete?: string
  required?: boolean
  hint?: string
  showPassword: boolean
  onToggle: () => void
  toggleLabel: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      <div className="flex items-center gap-2">
        <input
          name={name}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          minLength={8}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 rounded-md border border-border px-3 py-2 text-xs font-medium text-text-muted hover:bg-surface-2 hover:text-text"
        >
          {toggleLabel}
        </button>
      </div>
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
