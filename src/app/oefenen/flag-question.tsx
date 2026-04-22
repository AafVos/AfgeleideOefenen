'use client'

import { useState, useTransition } from 'react'

import { cn } from '@/components/ui'

import { flagQuestionAction } from './flag-actions'

export function FlagQuestionButton({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await flagQuestionAction(questionId, reason)
      if (result.ok) {
        setStatus('sent')
        setOpen(false)
      } else {
        setStatus('error')
        setError(result.error)
      }
    })
  }

  if (status === 'sent') {
    return (
      <span className="text-xs text-text-muted">
        Bedankt — we kijken er naar.
      </span>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-text-muted underline-offset-2 hover:text-accent-2 hover:underline"
      >
        Klopt niet?
      </button>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3 shadow-sm sm:flex-row sm:items-center"
    >
      <input
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Wat klopt er niet?"
        className="min-w-48 flex-1 rounded-md border border-border bg-surface px-2 py-1 text-sm outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
        maxLength={500}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            'rounded-md bg-accent-2 px-3 py-1 text-sm font-medium text-white hover:bg-accent-2/90 disabled:opacity-60',
          )}
        >
          {pending ? 'Versturen…' : 'Versturen'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setStatus('idle')
            setError(null)
          }}
          className="rounded-md border border-border px-3 py-1 text-sm text-text-muted hover:text-text"
        >
          Annuleer
        </button>
      </div>
      {status === 'error' && error && (
        <span className="text-xs text-accent-2">{error}</span>
      )}
    </form>
  )
}
