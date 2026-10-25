'use client'

import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'

import { zetHerinneringAan, zetHerinneringUit } from './herinnering-actions'

type Stap = 'rust' | 'leeftijd' | 'te-jong' | 'mislukt'

const knop =
  'inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60'
const knopVol = `${knop} bg-accent text-white shadow-sm hover:bg-accent/90`
const knopLeeg = `${knop} border border-border bg-surface text-text hover:bg-surface-2`

/**
 * De schakelaar voor de herinneringsmail (zie AFG-487).
 *
 * Van de leerlingen die ooit begonnen kwam 72% maar op één dag terug. Dit is
 * het enige wat hen terughaalt, dus staat hij hier op het dashboard en niet
 * weggestopt bij de instellingen.
 *
 * Opt-in: standaard uit, en pas aan nadat de leerling zelf gezegd heeft dat
 * hij 16 of ouder is. Onder de 16 hoort er toestemming van een ouder bij, en
 * die is er nog niet — dan blijft hij dus uit.
 */
export function HerinneringKaart({ aan }: { aan: boolean }) {
  const t = useTranslations('Dashboard')
  const [staatAan, setStaatAan] = useState(aan)
  const [stap, setStap] = useState<Stap>('rust')
  const [bezig, start] = useTransition()

  function aanzetten() {
    start(async () => {
      const { gelukt } = await zetHerinneringAan()
      setStaatAan(gelukt)
      setStap(gelukt ? 'rust' : 'mislukt')
    })
  }

  function uitzetten() {
    start(async () => {
      const { gelukt } = await zetHerinneringUit()
      setStaatAan(!gelukt)
      setStap(gelukt ? 'rust' : 'mislukt')
    })
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
        {t('herinneringTitle')}
      </div>

      {staatAan ? (
        <>
          <p className="mt-2 text-sm text-text">{t('herinneringAan')}</p>
          <button type="button" onClick={uitzetten} disabled={bezig} className={`${knopLeeg} mt-3`}>
            {t('herinneringUitzetten')}
          </button>
        </>
      ) : stap === 'leeftijd' ? (
        <>
          <p className="mt-2 text-sm text-text">{t('herinneringLeeftijd')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={aanzetten} disabled={bezig} className={knopVol}>
              {t('herinneringJa')}
            </button>
            <button
              type="button"
              onClick={() => setStap('te-jong')}
              disabled={bezig}
              className={knopLeeg}
            >
              {t('herinneringNee')}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-text-muted">{t('herinneringUit')}</p>
          <button
            type="button"
            onClick={() => setStap('leeftijd')}
            disabled={bezig}
            className={`${knopVol} mt-3`}
          >
            {t('herinneringAanzetten')}
          </button>
          {stap === 'te-jong' && (
            <p className="mt-3 text-xs text-text-muted">{t('herinneringTeJong')}</p>
          )}
        </>
      )}

      {stap === 'mislukt' && (
        <p role="status" className="mt-3 text-xs text-text-muted">
          {t('herinneringMislukt')}
        </p>
      )}
    </div>
  )
}
