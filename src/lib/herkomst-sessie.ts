/**
 * Onthoudt de herkomst van een bezoek, zonder cookie.
 *
 * `herkomst.ts` leest `?van=` alleen van de pagina waar die op staat. Komt
 * iemand via `/nl?van=youtube` binnen en klikt hij pas later op Registreren,
 * dan is die `?van=` dan al weg uit de adresregel. Dit bestand zet de eerste
 * herkomst van het bezoek opzij in `sessionStorage` — dezelfde plek als
 * `src/lib/meten/melden.ts` gebruikt — zodat het registratieformulier en de
 * Google-knop hem later nog kunnen ophalen.
 *
 * Eén bezoek, één herkomst: de eerste pagina die een herkomst meestuurt wint.
 * Een latere pagina zonder herkomst, of met een andere, overschrijft niets.
 */

import { herkomstVanUtmSource, leesHerkomst, type Herkomst } from './herkomst'
import type { Bewaarplek } from './meten/melden'

const SLEUTEL = 'eerste-herkomst'

/**
 * Herkomst uit één adresregel: `?van=` heeft voorrang op `?utm_source=`.
 */
export function herkomstUitZoekreeks(zoekreeks: string): Herkomst | null {
  const parameters = new URLSearchParams(zoekreeks.replace(/^\?/, ''))
  return leesHerkomst(parameters.get('van')) ?? herkomstVanUtmSource(parameters.get('utm_source'))
}

/**
 * Zet de herkomst van deze pagina opzij, maar alleen als dit bezoek er nog
 * geen had. Los van de browser, zodat het te testen is zonder er een te
 * starten.
 */
export function bewaarEersteHerkomst(opslag: Bewaarplek, zoekreeks: string): void {
  if (opslag.getItem(SLEUTEL) !== null) return
  const gevonden = herkomstUitZoekreeks(zoekreeks)
  if (!gevonden) return
  opslag.setItem(SLEUTEL, gevonden)
}

/** De opgeslagen herkomst van dit bezoek, of `null` als er niets staat. */
export function opgehaaldeHerkomst(opslag: Bewaarplek): Herkomst | null {
  return leesHerkomst(opslag.getItem(SLEUTEL))
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

/**
 * Onthoudt de herkomst van deze pagina voor de rest van het bezoek. Draait
 * zo vroeg mogelijk (`src/components/meten.tsx`), bij elk paginabezoek.
 */
export function onthoudEersteHerkomst(): void {
  if (typeof window === 'undefined') return
  const opslag = bewaarplek()
  if (!opslag) return
  try {
    bewaarEersteHerkomst(opslag, window.location.search)
  } catch {
    // Vol of geweigerd: dan onthouden we deze herkomst niet.
  }
}

/**
 * Haalt de voor dit bezoek bewaarde herkomst op, voor het registratieformulier
 * en de Google-knop. Geeft `null` als er niets staat of de browser het niet
 * toelaat.
 */
export function haalOnthoudenHerkomst(): Herkomst | null {
  const opslag = bewaarplek()
  if (!opslag) return null
  try {
    return opgehaaldeHerkomst(opslag)
  } catch {
    return null
  }
}
