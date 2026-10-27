'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { onthoudEersteHerkomst } from '@/lib/herkomst-sessie'
import { pikRegistratieUitAdres } from '@/lib/meten/melden'
import type { Meter } from '@/lib/meten/meter'

/**
 * Zet de klikmeting aan, maar pas nadat de pagina er staat.
 *
 * Het meetscriptje zelf komt uit een eigen klein bestand en wordt hier pas
 * binnengehaald als de browser klaar is met tekenen. Zo wordt de pagina er
 * niet trager van. Meet hij niets (testbrowser, crawler, lokaal), dan geeft
 * `startMeten` niets terug en gebeurt er verder ook niets.
 */
export function Meten() {
  const pad = usePathname()
  const meter = useRef<Meter | null>(null)
  const eerste = useRef(true)

  useEffect(() => {
    let gestopt = false

    // Dit moet wél meteen, en niet pas als het meetscriptje er is: kwam dit
    // tabblad net terug van "Doorgaan met Google" met een nieuw account, dan
    // staat dat in de adresregel. Klikt de leerling in die paar seconden
    // alweer door, dan is die adresregel weg. Dit zet hem opzij; het
    // meetscriptje telt hem zodra het er is. Het is een paar regels en raakt
    // het netwerk niet.
    pikRegistratieUitAdres()

    // Ook meteen: de herkomst van deze pagina (`?van=` of `?utm_source=`)
    // opzij zetten voor de rest van het bezoek. Zo overleeft hij een klik
    // naar Registreren, ook als die link zelf geen `?van=` heeft.
    onthoudEersteHerkomst()

    const laden = () => {
      void import('@/lib/meten/meter').then(({ startMeten }) => {
        if (gestopt) return
        meter.current = startMeten()
      })
    }

    // requestIdleCallback kent niet elke browser; dan een korte wachttijd.
    const rustig = typeof window.requestIdleCallback === 'function'
    const sein = rustig
      ? window.requestIdleCallback(laden, { timeout: 3000 })
      : window.setTimeout(laden, 1200)

    return () => {
      gestopt = true
      if (rustig) window.cancelIdleCallback(sein)
      else window.clearTimeout(sein)
      meter.current?.stop()
      meter.current = null
    }
  }, [])

  // Navigatie binnen de app telt ook als paginabezoek. Het eerste bezoek
  // meldt `startMeten` zelf al.
  useEffect(() => {
    if (eerste.current) {
      eerste.current = false
      return
    }
    meter.current?.pagina()
  }, [pad])

  return null
}
