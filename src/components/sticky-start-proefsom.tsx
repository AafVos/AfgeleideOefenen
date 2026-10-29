'use client'

import { useEffect, useState } from 'react'

/**
 * Plakkende knop onderaan de startpagina (telefoon én computer), zodat de
 * proefsom-CTA bereikbaar blijft voor een bezoeker die scrolt zonder meteen
 * te starten (AFG-739). Toont zich zodra de knop met `primaryId` uit beeld
 * scrolt, en verdwijnt zodra er ook maar één pixel van de sectie met
 * `doelId` (de proefsom zelf) in beeld komt — en blijft daarna verborgen,
 * ook als je terugscrolt.
 *
 * Bewust "ook maar één pixel", niet "helemaal voorbij" (de vorige aanpak,
 * controle-FAIL op PR #451): de proefsom-sectie is vaak hoger dan het
 * scherm, dus "voorbij" liet de knop het hele stuk daartussen over het
 * antwoordveld en de knoppenrij heen liggen. Op deze pagina staat de
 * proefsom bovendien maar een handvol pixels onder de hero-knop, dus in de
 * praktijk verschijnt deze balk vooral op een laag scherm (een telefoon met
 * nog zichtbare browserbalk, of een klein browservenster) — dat is het
 * scenario uit AFG-739 (bezoekers die wegklikken zonder de proefsom te
 * zien). Overlap met de proefsom zelf kan hiermee nooit gebeuren.
 *
 * Op de computer staat de voettekst altijd vast onderin het scherm (zie
 * `(start)/layout.tsx`: daar staat hij buiten de scrollende `main`). Deze
 * balk schuift daarom vanaf `sm` een footer-hoogte (ca. 61px) omhoog, anders
 * zou hij daar precies bovenop vallen.
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
  const [doelBereikt, setDoelBereikt] = useState(false)

  useEffect(() => {
    const hero = document.getElementById(primaryId)
    const doel = document.getElementById(doelId)
    if (!hero || !doel) return

    const heroObserver = new IntersectionObserver(([entry]) =>
      setHeroUitBeeld(!entry.isIntersecting),
    )
    heroObserver.observe(hero)

    const doelObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setDoelBereikt(true)
    })
    doelObserver.observe(doel)

    return () => {
      heroObserver.disconnect()
      doelObserver.disconnect()
    }
  }, [primaryId, doelId])

  if (!heroUitBeeld || doelBereikt) return null

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
