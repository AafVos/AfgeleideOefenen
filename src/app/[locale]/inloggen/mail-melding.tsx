'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

/** Wat `/auth/callback` over de bevestigingslink doorgaf. */
export type Mail = 'bevestigd' | 'verlopen' | 'onbekend'

/**
 * De `#`-staart zoals hij was toen de pagina openging. Eén keer lezen en
 * onthouden: hieronder wordt hij uit de adresregel gehaald, en dan hoort de
 * melding niet alsnog om te slaan.
 */
let staartBijBinnenkomst: string | null = null

function leesStaart(): string {
  staartBijBinnenkomst ??= window.location.hash
  return staartBijBinnenkomst
}

/** Op de server is er geen adresregel om in te kijken. */
function geenStaart(): string {
  return ''
}

/** Niemand verandert de staart onderweg, dus er valt niets te volgen. */
function nietVolgen(): () => void {
  return () => {}
}

function standUit(mail: Mail, staart: string): 'bevestigd' | 'verlopen' | null {
  if (mail !== 'onbekend') return mail
  if (!staart) return null
  return new URLSearchParams(staart.slice(1)).has('access_token')
    ? 'bevestigd'
    : 'verlopen'
}

/**
 * De melding boven het inlogformulier na het klikken op een bevestigingslink.
 *
 * Bij `bevestigd` en `verlopen` wist `/auth/callback` het al: dat stond in de
 * adresregel. Bij `onbekend` zette Supabase het antwoord achter de `#`, en dat
 * stuk stuurt een browser nooit naar de server. Dat gebeurt bij de link uit
 * een opnieuw gestuurde bevestigingsmail. Alleen hier, in de browser, is dan
 * te zien of de link werkte (`access_token`) of op was (`error`).
 */
export function MailMelding({ mail }: { mail: Mail }) {
  const t = useTranslations('Login')
  const staart = useSyncExternalStore(nietVolgen, leesStaart, geenStaart)

  useEffect(() => {
    // De staart uit de adresregel halen: er kan een geldig toegangsbewijs in
    // staan, en dat hoort niet in de geschiedenis van de browser te blijven.
    if (!window.location.hash) return
    const schoon = window.location.pathname + window.location.search
    window.history.replaceState(null, '', schoon)
  }, [])

  const stand = standUit(mail, staart)
  if (!stand) return null

  if (stand === 'bevestigd') {
    return (
      <p
        role="status"
        className="mt-6 rounded-md border border-accent/30 bg-accent-light px-3 py-2 text-sm text-accent"
      >
        {t('confirmedNotice')}
      </p>
    )
  }

  return (
    <p
      role="alert"
      className="mt-6 rounded-md border border-accent-2/30 bg-accent-2-light px-3 py-2 text-sm text-accent-2"
    >
      {t('expiredNotice')}
    </p>
  )
}
