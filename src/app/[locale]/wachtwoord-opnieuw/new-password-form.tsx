'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useTranslations } from 'next-intl'

import { newPasswordAction, type NewPasswordState } from './actions'

const initial: NewPasswordState = { error: null }

export function NewPasswordForm() {
  const t = useTranslations('NewPassword')
  const [state, action] = useActionState(newPasswordAction, initial)

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-text">{t('passwordLabel')}</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <p className="mt-1 text-xs text-text-muted">{t('passwordHint')}</p>
      </label>
      <SubmitBtn />
    </form>
  )
}

function SubmitBtn() {
  const { pending } = useFormStatus()
  const t = useTranslations('NewPassword')
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
