'use client'

import { useEffect, useState } from 'react'

/**
 * Plakkende knop onderaan de startpagina (telefoon én computer), zodat de
 * proefsom-CTA bereikbaar blijft voor een bezoeker die scrolt zonder meteen
 * te starten (AFG-739). Toont zich zodra de knop met `primaryId` uit beeld
 * scrolt, en blijft daarna staan — net als `StickyProbeerBalk` op de
 * voorbeeldpagina's (AFG-624).
 *
 * Board-keuze na twee controle-FAILs (AFG-751, 31-10-2026): op deze pagina
 * staat de proefsom maar een handvol pixels onder de hero-knop, waardoor
 * "verberg zodra de proefsom in beeld komt" de balk op vrijwel elk scherm
 * nooit liet verschijnen. In plaats daarvan blijft de balk gewoon staan, en
 * lost `home-demo.tsx` het overlap-risico met het antwoordveld en de
 * knoppenrij op met extra onderpadding op de proefsom-sectie zelf.
 *
 * Op de computer staat de voettekst altijd vast onderin het scherm (zie
 * `(start)/layout.tsx`: daar staat hij buiten de scrollende `main`). Deze
 * balk schuift daarom vanaf `sm` een footer-hoogte (ca. 61px) omhoog, anders
 * zou hij daar precies bovenop vallen.
 */
export function StickyStartProefsom({
  tekst,
  primaryId,
}: {
  tekst: string
  primaryId: string
}) {
  const [heroUitBeeld, setHeroUitBeeld] = useState(false)

  useEffect(() => {
    const hero = document.getElementById(primaryId)
    if (!hero) return

    const observer = new IntersectionObserver(([entry]) => setHeroUitBeeld(!entry.isIntersecting))
    observer.observe(hero)

    return () => observer.disconnect()
  }, [primaryId])

  if (!heroUitBeeld) return null

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
