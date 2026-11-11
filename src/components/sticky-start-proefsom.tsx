'use client'

import { useEffect, useState } from 'react'

/**
 * Plakkende knop onderaan de startpagina (telefoon én computer), zodat de
 * proefsom bereikbaar blijft voor een bezoeker die voorbij scrolt zonder
 * hem te maken (AFG-739). Toont zich zodra de sectie met `doelId` (de
 * proefsom-kaart, direct onder de H1 sinds AFG-778) uit beeld scrolt, en
 * blijft daarna staan — net als `StickyProbeerBalk` op de voorbeeldpagina's
 * (AFG-624).
 *
 * Board-keuze na twee controle-FAILs op een eerdere versie (AFG-751,
 * 31-10-2026): toen stond de proefsom nog een eindje ónder een aparte
 * hero-knop, met te weinig ruimte ertussen om zowel "verschijnt als
 * vangnet" als "overlapt nooit" tegelijk te laten kloppen. AFG-778 (gemerged
 * tijdens deze pull request) heeft dat probleem intussen al opgelost door
 * de proefsom direct onder de H1 te zetten — wie niet scrolt, ziet hem meteen.
 * Deze balk vangt nu het andere geval op: wie wél voorbij de proefsom
 * scrolt (bijvoorbeeld naar de uitleg of de FAQ) zonder hem te maken.
 *
 * Op de computer staat de voettekst altijd vast onderin het scherm (zie
 * `(start)/layout.tsx`: daar staat hij buiten de scrollende `main`). Deze
 * balk schuift daarom vanaf `sm` een footer-hoogte (ca. 61px) omhoog, anders
 * zou hij daar precies bovenop vallen.
 */
export function StickyStartProefsom({ doelId }: { doelId: string }) {
  const [uitBeeld, setUitBeeld] = useState(false)

  useEffect(() => {
    const doel = document.getElementById(doelId)
    if (!doel) return

    const observer = new IntersectionObserver(([entry]) => setUitBeeld(!entry.isIntersecting))
    observer.observe(doel)

    return () => observer.disconnect()
  }, [doelId])

  if (!uitBeeld) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center border-t border-border bg-surface p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-16 sm:border-0 sm:bg-transparent sm:p-0">
      <a
        href="#proefsom"
        data-meet="start-sticky-proefsom"
        className="flex min-h-11 w-full max-w-xs items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
      >
        Maak de proefsom
      </a>
    </div>
  )
}
