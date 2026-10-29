'use client'

import { useEffect, useState } from 'react'

/**
 * Plakkende knop onderaan de startpagina (telefoon én computer), zodat de
 * proefsom-CTA bereikbaar blijft voor een bezoeker die scrolt zonder meteen
 * te starten (AFG-739). Toont zich zodra de knop met `primaryId` uit beeld
 * scrolt, en verdwijnt weer zodra de bezoeker bij de sectie met `doelId`
 * (de proefsom zelf) is aangekomen — daar is de vangnet-knop overbodig en
 * zou hij anders de rest van de pagina (FAQ, slot-CTA) blijven overlappen.
 *
 * Op de computer staat de voettekst altijd vast onderin het scherm (zie
 * `(start)/layout.tsx`: daar staat hij buiten de scrollende `main`). Deze
 * balk schuift daarom vanaf `sm` een footer-hoogte (ca. 61px) omhoog, anders
 * zou hij daar precies bovenop vallen. Op de telefoon scrolt de voettekst
 * gewoon mee en is de balk daarvoor allang verdwenen (zie `voorbijDoel`
 * hierboven), dus daar kan hij gewoon onderaan blijven plakken.
 */
export function StickyStartProefsom({
  tekst,
  primaryId,
  doelId,
}: {
  tekst: string
  primaryId: string
  doelId: string
}) {
  const [heroUitBeeld, setHeroUitBeeld] = useState(false)
  const [voorbijDoel, setVoorbijDoel] = useState(false)

  useEffect(() => {
    const hero = document.getElementById(primaryId)
    const doel = document.getElementById(doelId)
    if (!hero || !doel) return

    const heroObserver = new IntersectionObserver(([entry]) =>
      setHeroUitBeeld(!entry.isIntersecting),
    )
    heroObserver.observe(hero)

    const doelObserver = new IntersectionObserver(([entry]) =>
      setVoorbijDoel(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    )
    doelObserver.observe(doel)

    return () => {
      heroObserver.disconnect()
      doelObserver.disconnect()
    }
  }, [primaryId, doelId])

  if (!heroUitBeeld || voorbijDoel) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center border-t border-border bg-surface p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-16 sm:border-0 sm:bg-transparent sm:p-0">
      <a
        href="#proefsom"
        data-meet="start-sticky-proefsom"
        className="flex min-h-11 w-full max-w-xs items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
      >
        {tekst}
      </a>
    </div>
  )
}
