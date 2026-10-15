'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { googleCallbackAdres } from '@/lib/auth/google'
import { createClient } from '@/lib/supabase/client'

export function GoogleKnop({ oefenpad }: { oefenpad: string | null }) {
  const t = useTranslations('Google')
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState(false)

  async function start() {
    if (bezig) return
    setBezig(true)
    setFout(false)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: googleCallbackAdres(window.location.origin, oefenpad),
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) {
      console.error('[google] aanmelden mislukt:', error.message)
      setFout(true)
      setBezig(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={start}
        disabled={bezig}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-surface px-4 py-2.5 font-medium text-text shadow-sm transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {bezig ? t('pending') : t('button')}
      </button>
      {fout ? (
        <p
          role="alert"
          className="rounded-md border border-accent-2/30 bg-accent-2-light px-3 py-2 text-sm text-accent-2"
        >
          {t('error')}
        </p>
      ) : null}
      <div className="flex items-center gap-3 text-sm text-text-muted">
        <span className="h-px flex-1 bg-border" />
        {t('or')}
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  )
}
