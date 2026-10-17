/**
 * Waarmee de site zelf iets aan de klikmeting meldt.
 *
 * De meter ziet kliks en paginabezoeken vanzelf, maar niet of een aanmelding
 * gelukt is. Dat weet alleen het formulier. Met `meldMeting('registratie')`
 * geeft het dat door.
 *
 * Dit bestandje staat bewust los van `meter.ts`: wie dit aanroept hoeft het
 * hele meetscriptje niet mee te laden. Meet de browser niets (testbrowser,
 * crawler, lokaal), dan luistert er niemand en gebeurt er ook niets.
 */

/** De naam van de gebeurtenis waar `meter.ts` naar luistert. */
export const EIGEN_MELDING = 'meet:gebeurtenis'

export type EigenMelding = {
  /** Voorlopig alleen `registratie`: de aanmelding is gelukt. */
  soort: 'registratie'
  doel?: string
}

export function meldMeting(soort: EigenMelding['soort'], doel?: string): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<EigenMelding>(EIGEN_MELDING, { detail: { soort, doel } }),
  )
}
