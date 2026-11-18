/**
 * Een nieuwe leerling die zijn eerste opgave open krijgt, weet vaak niet wat
 * er van hem verwacht wordt: typ je een heel antwoord, een formule, een
 * zin? Zonder duidelijkheid stopt hij na de opgave zonder iets te typen
 * (zie AFG-816).
 *
 * Deze sessie (tabblad) nog geen antwoord gehad: toon een korte hint boven
 * het antwoordveld. Zodra er één antwoord verzonden is, verdwijnt hij voor de
 * rest van dit bezoek — ook bij een volgende opgave.
 */

import type { Bewaarplek } from '@/lib/meten/melden'

const SLEUTEL = 'oefenen-eerste-antwoord-gehad'

/** Voor `useSyncExternalStore`: eigen tabblad, dus geen `storage`-event van een andere pagina nodig. */
const EVENT = 'oefenen-eerste-antwoord-gehad'

/** Heeft deze sessie al een antwoord verzonden? Los van de browser, zodat het te testen is zonder er een te starten. */
export function heeftAlGeantwoord(opslag: Bewaarplek): boolean {
  return opslag.getItem(SLEUTEL) !== null
}

/** Onthoudt dat deze sessie een antwoord heeft gehad: de format-hint mag vanaf nu weg. */
export function onthoudEersteAntwoord(opslag: Bewaarplek): void {
  opslag.setItem(SLEUTEL, '1')
}

/** De bewaarplek van dit tabblad, of niets als de browser hem niet geeft. */
function bewaarplek(): Bewaarplek | null {
  try {
    if (typeof window === 'undefined') return null
    return window.sessionStorage ?? null
  } catch {
    // Privémodus of sessionStorage uit.
    return null
  }
}

/** Snapshot voor `useSyncExternalStore`: mag de format-hint nu getoond worden? */
export function leesToonHint(): boolean {
  const opslag = bewaarplek()
  if (!opslag) return false
  try {
    return !heeftAlGeantwoord(opslag)
  } catch {
    return false
  }
}

/** Abonnement voor `useSyncExternalStore`: de hint wisselt alleen na `meldEersteAntwoord`. */
export function subscribeToonHint(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange)
  return () => window.removeEventListener(EVENT, onChange)
}

/** Meldt dat er net een antwoord verzonden is: de format-hint verdwijnt vanaf nu. */
export function meldEersteAntwoord(): void {
  const opslag = bewaarplek()
  if (!opslag) return
  try {
    onthoudEersteAntwoord(opslag)
  } catch {
    // Vol of geweigerd: dan blijft de hint gewoon nog even staan.
    return
  }
  window.dispatchEvent(new Event(EVENT))
}
