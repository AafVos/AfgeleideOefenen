'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { resendConfirmationAction } from './actions'

export function VerlopenMailForm() {
  const t = useTranslations('Login')
  const [email, setEmail] = useState('')
  const [resendPending, startResend] = useTransition()
  const [resendResult, setResendResult] = useState<'nog-niet' | 'gelukt' | 'mislukt' | 'leeg'>('nog-niet')

  function handleResend() {
    if (!email.trim()) {
      setResendResult('leeg')
      return
    }
    startResend(async () => {
      const { ok } = await resendConfirmationAction(email.trim())
      setResendResult(ok ? 'gelukt' : 'mislukt')
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleResend()
      }}
      className="space-y-3"
      noValidate
    >
      {resendResult === 'gelukt' ? (
        <p role="status" className="rounded-md border border-accent/30 bg-accent-light px-3 py-2 text-sm text-accent">
          {t('resendExpiredSuccess')}
        </p>
      ) : (
        <>
          {resendResult === 'mislukt' && (
            <p role="alert" className="rounded-md border border-accent-2/30 bg-accent-2-light px-3 py-2 text-sm text-accent-2">
              {t('resendError')}
            </p>
          )}
          {resendResult === 'leeg' && (
            <p role="alert" className="rounded-md border border-accent-2/30 bg-accent-2-light px-3 py-2 text-sm text-accent-2">
              {t('errorMissingEmail')}
            </p>
          )}
          <label className="block">
            <span className="sr-only">{t('emailLabel')}</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder={t('emailLabel')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>
          <button
            type="submit"
            disabled={resendPending}
            className="w-full rounded-md bg-accent px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendPending ? t('resendPending') : t('resendExpiredButton')}
          </button>
        </>
      )}
    </form>
  )
}