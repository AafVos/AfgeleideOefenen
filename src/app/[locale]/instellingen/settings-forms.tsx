'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useTranslations } from 'next-intl'

import {
  updatePasswordAction,
  updateUsernameAction,
  type SettingsState,
} from './actions'

const initialState: SettingsState = { error: null, success: null }

function StateBanner({ state }: { state: SettingsState }) {
  if (state.error) {
    return (
      <p
        role="alert"
        className="rounded-md border border-accent-2/30 bg-accent-2-light px-3 py-2 text-sm text-accent-2"
      >
        {state.error}
      </p>
    )
  }
  if (state.success) {
    return (
      <p
        role="status"
        className="rounded-md border border-accent/30 bg-accent-light px-3 py-2 text-sm text-accent"
      >
        {state.success}
      </p>
    )
  }
  return null
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

const inputClass =
  'w-full max-w-sm rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20'

export function UsernameForm({ initialUsername }: { initialUsername: string }) {
  const [state, formAction] = useActionState(updateUsernameAction, initialState)
  const t = useTranslations('Settings')
  const [editing, setEditing] = useState(initialUsername === '')
  const [savedName, setSavedName] = useState(initialUsername)

  useEffect(() => {
    if (state.success && state.username) {
      setSavedName(state.username)
      setEditing(false)
    }
  }, [state])

  if (!editing) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-text-muted">
          {t('usernameLabel')}:{' '}
          <span className={savedName ? 'font-medium text-text' : ''}>
            {savedName || t('noUsername')}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="ml-3 font-medium text-accent hover:underline"
          >
            {t('change')}
          </button>
        </p>
        <StateBanner state={state} />
      </div>
    )
  }

  return (
    <form action={formAction} className="mt-2 space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-text">
          {t('usernameLabel')}
        </span>
        <input
          name="username"
          type="text"
          defaultValue={savedName}
          maxLength={40}
          autoComplete="username"
          autoFocus
          className={inputClass}
        />
      </label>
      <StateBanner state={state} />
      <div className="flex items-center gap-3">
        <SubmitButton label={t('save')} pendingLabel={t('savePending')} />
        {savedName && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm font-medium text-text-muted hover:text-text"
          >
            {t('cancel')}
          </button>
        )}
      </div>
    </form>
  )
}

export function PasswordForm() {
  const [state, formAction] = useActionState(updatePasswordAction, initialState)
  const t = useTranslations('Settings')

  return (
    <form action={formAction} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-text">
          {t('newPasswordLabel')}
        </span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-text-muted">{t('passwordHint')}</span>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-text">
          {t('repeatPasswordLabel')}
        </span>
        <input
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
      </label>
      <StateBanner state={state} />
      <SubmitButton label={t('savePassword')} pendingLabel={t('savePending')} />
    </form>
  )
}
