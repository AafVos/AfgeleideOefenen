'use client'

import { useEffect, useState } from 'react'

import { ProbeerKnop } from '@/components/probeer-knop'

const KNOP_CLASSNAME =
  'flex min-h-11 w-full items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent/90'

/**
 * Plakkende balk onderaan op een smal scherm, zodat "Probeer 3 sommen"
 * bereikbaar blijft terwijl een leerling door de uitwerking scrolt. Toont
 * zich pas zodra de knop met `primaryId` niet meer in beeld is, zodat er
 * nooit twee knoppen tegelijk zichtbaar zijn.
 */
export function StickyProbeerBalk({ oefenen, primaryId }: { oefenen: string; primaryId: string }) {
  const [zichtbaar, setZichtbaar] = useState(false)

  useEffect(() => {
    const doel = document.getElementById(primaryId)
    if (!doel) return

    const observer = new IntersectionObserver(([entry]) => setZichtbaar(!entry.isIntersecting))
    observer.observe(doel)
    return () => observer.disconnect()
  }, [primaryId])

  if (!zichtbaar) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <ProbeerKnop oefenen={oefenen} dataMeet="probeer-3-sommen-sticky" className={KNOP_CLASSNAME} />
    </div>
  )
}
