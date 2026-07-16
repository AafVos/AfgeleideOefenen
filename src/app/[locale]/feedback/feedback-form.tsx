'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useTranslations } from 'next-intl'

import { sendFeedbackAction, type FeedbackState } from './actions'

const initialState: FeedbackState = { error: null, sent: false }

function SubmitButton() {
  const { pending } = useFormStatus()
  const t = useTranslations('Feedback')
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? t('submitPending') : t('submitLabel')}
    </button>
  )
}

export function FeedbackForm() {
  const [state, formAction] = useActionState(sendFeedbackAction, initialState)
  const t = useTranslations('Feedback')

  if (state.sent) {
    return (
      <p
        role="status"
        className="rounded-md border border-accent/30 bg-accent-light px-3 py-2 text-sm text-accent"
      >
        {t('thanks')}
      </p>
    )
  }

  return (
    <form action={formAction} className="space-y-3">
      <textarea
        name="message"
        required
        rows={6}
        maxLength={5000}
        placeholder={t('placeholder')}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
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
