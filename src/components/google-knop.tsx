'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { googleCallbackAdres } from '@/lib/auth/google'
import type { Herkomst } from '@/lib/herkomst'
import { haalOnthoudenHerkomst } from '@/lib/herkomst-sessie'
import { createClient } from '@/lib/supabase/client'

/** Het gekleurde G-logo, in de code zelf zodat er niets van buiten wordt geladen. */
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden className="shrink-0">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

export function GoogleKnop({
  oefenpad,
  herkomst,
  dataMeet = 'google-aanmelden',
}: {
  oefenpad: string | null
  /**
   * Meegegeven herkomst, bijvoorbeeld van het registratieformulier. Ontbreekt
   * die, dan valt deze knop terug op wat voor dit bezoek is onthouden
   * (`src/lib/herkomst-sessie.ts`), zodat ook `/proberen` en andere plekken
   * met een Google-knop een herkomst kunnen meegeven.
   */
  herkomst?: Herkomst | null
  dataMeet?: string
}) {
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
        redirectTo: googleCallbackAdres(
          window.location.origin,
          oefenpad,
          herkomst ?? haalOnthoudenHerkomst(),
        ),
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
        data-meet={dataMeet}
        onClick={start}
        disabled={bezig}
        className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-2.5 font-medium text-text shadow-sm transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleLogo />
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
