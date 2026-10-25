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
 * site pikt het op en haalt het meteen weer weg. Bewust geen koekje: de
 * klikmeting belooft op de privacypagina dat ze er geen gebruikt.
 *
 * Tussen het oppikken en het tellen zit een gat: het meetscriptje laadt pas
 * als de browser klaar is met tekenen (zie `src/components/meten.tsx`), en
 * dat kan tot drie seconden duren. Een melding die in dat gat valt was
 * vroeger weg — niemand luisterde, en de parameter was al uit de adresregel.
 * Daarom wacht een gemelde aanmelding nu in `sessionStorage` tot de meter er
 * is. Dat is dezelfde plek waar het sessie-id van het tabblad staat: hij
 * hoort bij dit ene tabblad en overleeft geen nieuw tabblad. Er staat alleen
 * de manier van aanmelden in, nooit iets over wie de leerling is.
 *
 * Eén aanmelding telt één keer per tabblad. Zodra er geteld is blijft er een
 * merkteken staan, zodat een herlaadactie of de terugknop er geen tweede van
 * maakt.
 *
 * Dit bestandje staat bewust los van `meter.ts`: wie dit aanroept hoeft het
 * hele meetscriptje niet mee te laden. Meet de browser niets (testbrowser,
 * crawler, lokaal), dan telt er uiteindelijk niemand iets, en gebeurt er
 * verder ook niets.
 */

/** De naam van de gebeurtenis waar `meter.ts` naar luistert. */
export const EIGEN_MELDING = 'meet:gebeurtenis'

export type EigenMelding = {
  /** Voorlopig alleen `registratie`: de aanmelding is gelukt. */
  soort: 'registratie'
  doel?: string
}

/**
 * De parameter waarin de server kwijt kan dat er zojuist een account is
 * aangemaakt buiten het registratieformulier om. Er staat alleen de manier van
 * aanmelden in, nooit iets over wie de leerling is. `schoonPad` bewaart hem
 * niet, dus hij komt ook niet in de gemeten paden terecht.
 */
export const REGISTRATIE_PARAMETER = 'nieuw'

/** Waar een gemelde aanmelding wacht tot het meetscriptje er is. */
export const REGISTRATIE_PLEK = 'meet-registratie'

/** Het merkteken dat dit tabblad zijn aanmelding al geteld heeft. */
export const REGISTRATIE_GETELD = 'meet-registratie-geteld'

/**
 * Staat voor "een aanmelding zonder nadere herkomst". `sessionStorage` kent
 * alleen tekst, en lege tekst is niet te onderscheiden van niets.
 */
export const ZONDER_DOEL = '-'

/** Wat erin mag staan, en hoe die aanmelding in de meting heet. */
const REGISTRATIE_DOELEN: Record<string, string> = {
  google: 'registratie-via-google',
}

/** Het stukje `sessionStorage` dat we gebruiken, los van de browser. */
export type Bewaarplek = {
  getItem(sleutel: string): string | null
  setItem(sleutel: string, waarde: string): void
  removeItem(sleutel: string): void
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
 * Zet een gemelde aanmelding opzij tot het meetscriptje erom vraagt. Heeft
 * dit tabblad er al een geteld, dan gebeurt er niets: één aanmelding is één
 * aanmelding, ook na een herlaadactie of de terugknop.
 */
export function bewaarRegistratie(opslag: Bewaarplek, doel: string | null): void {
  if (opslag.getItem(REGISTRATIE_GETELD) !== null) return
  opslag.setItem(REGISTRATIE_PLEK, doel || ZONDER_DOEL)
}

/**
 * Haalt de opzijgezette aanmelding op. Daarna is hij op: wie nog eens vraagt
 * krijgt `null`. Geeft `ZONDER_DOEL` terug als er geen herkomst bij zat;
 * `doelVanBewaard` maakt daar weer `null` van.
 */
export function pakRegistratie(opslag: Bewaarplek): string | null {
  const bewaard = opslag.getItem(REGISTRATIE_PLEK)
  if (bewaard === null) return null
  opslag.removeItem(REGISTRATIE_PLEK)
  opslag.setItem(REGISTRATIE_GETELD, '1')
  return bewaard
}

/** Wat er als doel in de tabel komt: `ZONDER_DOEL` betekent "geen". */
export function doelVanBewaard(bewaard: string | null): string | null {
  if (bewaard === null || bewaard === ZONDER_DOEL) return null
  return bewaard
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
 * Meldt een geslaagde aanmelding aan de klikmeting.
 *
 * De melding gaat eerst opzij en dan pas de deur uit. Luistert de meter al,
 * dan telt hij hem meteen; is hij er nog niet, dan pikt hij hem op zodra hij
 * start. Hoe dan ook maar één keer: beide wegen halen hem van dezelfde plek.
 */
export function meldMeting(soort: EigenMelding['soort'], doel?: string): void {
  if (typeof window === 'undefined') return

  const opslag = bewaarplek()
  if (soort === 'registratie' && opslag) {
    try {
      bewaarRegistratie(opslag, doel ?? null)
    } catch {
      // Vol of geweigerd: dan telt deze aanmelding niet mee.
    }
  }

  window.dispatchEvent(
    new CustomEvent<EigenMelding>(EIGEN_MELDING, { detail: { soort, doel } }),
  )
}

/**
 * Pikt een door de server klaargezette aanmelding uit de adresregel, haalt de
 * parameter meteen weg en zet de aanmelding opzij.
 *
 * Dit draait zo vroeg mogelijk (`src/components/meten.tsx`), dus nog voordat
 * het meetscriptje geladen is. Zo gaat de aanmelding niet verloren als de
 * leerling in die paar seconden alweer doorklikt.
 */
export function pikRegistratieUitAdres(): void {
  if (typeof window === 'undefined') return

  const { gevonden, doel, zoek } = registratieUitZoekreeks(window.location.search)
  if (!gevonden) return

  // Weg uit de adresregel, ook bij inhoud die we niet kennen: hij hoort daar
  // niet te blijven staan.
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${zoek}${window.location.hash}`,
  )

  if (!doel) return
  const opslag = bewaarplek()
  if (!opslag) return
  try {
    bewaarRegistratie(opslag, doel)
  } catch {
    // Vol of geweigerd: dan telt deze aanmelding niet mee.
  }
}

/**
 * De aanmelding die op geteld worden staat te wachten, of `null` als er niets
 * klaarstaat. Kijkt eerst nog een keer in de adresregel, voor het geval het
 * meetscriptje er eerder is dan de pagina die hem zou oppikken.
 *
 * Wat eruit komt is de bewaarde waarde, dus mogelijk `ZONDER_DOEL`. Haal het
 * doel voor de tabel eruit met `doelVanBewaard`.
 */
export function haalKlaargezetteRegistratie(): string | null {
  if (typeof window === 'undefined') return null

  pikRegistratieUitAdres()

  const opslag = bewaarplek()
  if (!opslag) return null
  try {
    return pakRegistratie(opslag)
  } catch {
    return null
  }
}
