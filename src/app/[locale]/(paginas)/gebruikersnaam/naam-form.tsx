'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useTranslations } from 'next-intl'

import { ErrorBanner } from '@/components/ui'

import { kiesNaamAction, type NaamState } from './actions'

const initialState: NaamState = { errorKey: null }

export function NaamForm({ oefenpad }: { oefenpad: string | null }) {
  const [state, formAction] = useActionState(kiesNaamAction, initialState)
  const t = useTranslations('Gebruikersnaam')

  return (
    <form action={formAction} className="space-y-4">
      {oefenpad ? <input type="hidden" name="naar" defaultValue={oefenpad} /> : null}
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-text">{t('usernameLabel')}</span>
        <input
          name="username"
          type="text"
          autoComplete="username"
          maxLength={40}
          defaultValue={state.username ?? ''}
          className="min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </label>

      {state.errorKey ? <ErrorBanner>{t(state.errorKey)}</ErrorBanner> : null}

      <VerderKnop />
    </form>
  )
}

function VerderKnop() {
  const { pending } = useFormStatus()
  const t = useTranslations('Gebruikersnaam')
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? t('submitPending') : t('submitLabel')}
    </button>
  )
}
