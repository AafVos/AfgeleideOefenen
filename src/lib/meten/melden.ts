/**
 * Waarmee de site zelf iets aan de klikmeting meldt.
 *
 * De meter ziet kliks en paginabezoeken vanzelf, maar niet of een aanmelding
 * gelukt is. Dat weet alleen het formulier. Met `meldMeting('registratie')`
 * geeft het dat door.
 *
 * Wie zich via Google aanmeldt komt niet langs dat formulier: die gaat weg
 * naar Google en komt ingelogd terug op de callback. Het tabblad kan dan niet
 * zien of er net een account is aangemaakt of dat een bekende leerling inlogt.
 * Daarom zet de server dat in de adresregel (zie `REGISTRATIE_PARAMETER`); de
 * meter pikt het op en haalt het meteen weer weg. Bewust geen koekje: de
 * klikmeting belooft op de privacypagina dat ze er geen gebruikt.
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

/**
 * De parameter waarin de server kwijt kan dat er zojuist een account is
 * aangemaakt buiten het registratieformulier om. Er staat alleen de manier van
 * aanmelden in, nooit iets over wie de leerling is. `schoonPad` bewaart hem
 * niet, dus hij komt ook niet in de gemeten paden terecht.
 */
export const REGISTRATIE_PARAMETER = 'nieuw'

/** Wat erin mag staan, en hoe die aanmelding in de meting heet. */
const REGISTRATIE_DOELEN: Record<string, string> = {
  google: 'registratie-via-google',
}

/**
 * Hoe die aanmelding in de meting heet. Onbekende inhoud geeft `null`, zodat
 * er nooit iets anders in de tabel komt dan wat hierboven staat.
 */
export function registratieDoel(waarde: string | null): string | null {
  if (!waarde) return null
  return REGISTRATIE_DOELEN[waarde] ?? null
}

/**
 * Wat er uit de adresregel komt en wat erin overblijft. Los van de browser,
 * zodat het te testen is zonder er een te starten.
 *
 * `gevonden` staat ook op `true` bij inhoud die we niet kennen: die parameter
 * moet net zo goed weg, anders blijft hij in de balk staan.
 */
export function registratieUitZoekreeks(zoekreeks: string): {
  gevonden: boolean
  doel: string | null
  zoek: string
} {
  const parameters = new URLSearchParams(zoekreeks.replace(/^\?/, ''))
  const waarde = parameters.get(REGISTRATIE_PARAMETER)
  if (waarde === null) return { gevonden: false, doel: null, zoek: zoekreeks }

  parameters.delete(REGISTRATIE_PARAMETER)
  const rest = parameters.toString()
  return { gevonden: true, doel: registratieDoel(waarde), zoek: rest ? `?${rest}` : '' }
}

/**
 * Haalt de klaargezette aanmelding uit de adresregel en wist de parameter
 * meteen. Zo telt één aanmelding ook maar één keer — ook als de leerling de
 * pagina opnieuw laadt — en staat er niets geks in de balk.
 */
export function haalKlaargezetteRegistratie(): string | null {
  if (typeof window === 'undefined') return null

  const { gevonden, doel, zoek } = registratieUitZoekreeks(window.location.search)
  if (!gevonden) return null

  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${zoek}${window.location.hash}`,
  )
  return doel
}
