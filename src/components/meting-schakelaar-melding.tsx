'use client'

import { NextIntlClientProvider, useTranslations } from 'next-intl'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { routing } from '@/i18n/routing'
import {
  pikMetenSchakelaarUitAdres,
  schakelaarUitZoekreeks,
  type MetenActie,
} from '@/lib/meten/schakelaar'
import berichten from '../../messages/nl.json'

const TAAL = routing.defaultLocale

/**
 * De actie zoals die was toen de pagina openging. Eén keer lezen en
 * onthouden: de effect hieronder haalt de parameter uit de adresregel, en
 * dan hoort de melding niet alsnog te verdwijnen.
 */
let actieBijBinnenkomst: MetenActie | null | undefined

function leesActie(): MetenActie | null {
  actieBijBinnenkomst ??= schakelaarUitZoekreeks(window.location.search).actie
  return actieBijBinnenkomst
}

/** Op de server is er geen adresregel om in te kijken. */
function geenActie(): null {
  return null
}

/** Niemand verandert de actie onderweg, dus er valt niets te volgen. */
function nietVolgen(): () => void {
  return () => {}
}

function Melding({ actie, onSluiten }: { actie: MetenActie; onSluiten: () => void }) {
  const t = useTranslations('Meten')

  useEffect(() => {
    const tijd = window.setTimeout(onSluiten, 6000)
    return () => window.clearTimeout(tijd)
  }, [onSluiten])

  return (
    // top-4, niet bottom-4: rechtsonder is de vaste plek van het poppetje
    // (zie welcome-tour.tsx en "Het poppetje" in docs/ontwerpregels.md).
    <div
      role="status"
      className="fixed inset-x-4 top-4 z-50 mx-auto max-w-sm rounded-lg border border-accent/30 bg-accent-light px-4 py-2 text-sm text-accent sm:inset-x-auto sm:right-4"
    >
      <div className="flex items-center gap-2">
        <p className="flex-1 py-1">{actie === 'uit' ? t('uitgezet') : t('aangezet')}</p>
        <button
          type="button"
          onClick={onSluiten}
          aria-label={t('sluiten')}
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-lg leading-none text-accent hover:bg-accent/10"
        >
          ×
        </button>
      </div>
    </div>
  )
}

/**
 * Pikt `?meten=uit` of `?meten=aan` uit de adresregel (de schakelaar zelf
 * staat in `src/lib/meten/schakelaar.ts`) en toont daarna één keer een
 * bevestiging.
 *
 * Staat buiten de `[locale]`-laag (zie `src/app/layout.tsx`), vandaar de
 * eigen `NextIntlClientProvider` — hetzelfde dat `FoutPagina` doet.
 */
export function MetingSchakelaarMelding() {
  const actie = useSyncExternalStore(nietVolgen, leesActie, geenActie)
  const [gesloten, setGesloten] = useState(false)

  useEffect(() => {
    // De echte mutatie: de parameter weghalen en de vlag zetten. Los van
    // `actie` hierboven, dat alleen leest — zo hoeft hier geen state bij.
    pikMetenSchakelaarUitAdres()
  }, [])

  if (!actie || gesloten) return null

  return (
    <NextIntlClientProvider locale={TAAL} messages={berichten}>
      <Melding actie={actie} onSluiten={() => setGesloten(true)} />
    </NextIntlClientProvider>
  )
}
