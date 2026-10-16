'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

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
