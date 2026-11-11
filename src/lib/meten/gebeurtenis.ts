/**
 * De rekenregels van de klikmeting, los van de browser en los van de
 * database. Alles hier is pure functie, zodat het te testen is.
 *
 * Wat we meten en wat niet staat in supabase/migrations/0072_site_gebeurtenissen.sql
 * en op de privacypagina. Kort: geen koekje, geen IP, geen user-agent, geen
 * e-mailadres of gebruikers-id, en nooit tekst die een leerling zelf typt.
 */

import { isGeldigeUuid } from '@/lib/uuid'

export const MEET_SOORTEN = [
  'pagina',
  'klik',
  'dode_klik',
  'woedeklik',
  'fout',
  'scroll',
  /** De aanmelding is gelukt. De site meldt dit zelf. */
  'registratie',
  /** Dit tabblad was uitgelogd en is nu ingelogd. Die zet de database erbij. */
  'inlog',
] as const
export type MeetSoort = (typeof MEET_SOORTEN)[number]

/**
 * Wat de browser zelf mag melden. `inlog` hoort daar niet bij: dat weet
 * alleen de server, en die zet hem er in `meet_opslaan` zelf bij.
 */
export const BROWSER_SOORTEN = MEET_SOORTEN.filter(
  (soort) => soort !== 'inlog',
) as readonly MeetSoort[]

export const MEET_APPARATEN = ['telefoon', 'tablet', 'computer'] as const
export type MeetApparaat = (typeof MEET_APPARATEN)[number]

export const SCROLL_STAPPEN = [25, 50, 75, 100] as const

/** Hoeveel een tabblad er per uur mag sturen. De database bewaakt dit ook. */
export const MAX_PER_UUR = 300

/** Hoeveel gebeurtenissen er hoogstens in één verzending zitten. */
export const MAX_PER_ZENDING = 40

/** Queryparameters die we bewaren. De rest gooien we weg. */
export const BEWAARDE_PARAMETERS = ['van', 'utm_source'] as const

export type Gebeurtenis = {
  sessie_id: string
  soort: MeetSoort
  pad: string
  doel: string | null
  waarde: number | null
  apparaat: MeetApparaat
  verwijzer: string | null
  /** `?utm_source=` van de landingspagina, bijvoorbeeld `chatgpt.com`. */
  utm_source: string | null
  ingelogd: boolean
}

/**
 * Het pad zonder queryparameters, op `van` en `utm_source` na. Die twee
 * vertellen waar een gedeelde link vandaan komt.
 */
export function schoonPad(pad: string, zoekreeks = ''): string {
  const alleen = pad.split('?')[0].split('#')[0] || '/'
  const kort = alleen.length > 200 ? alleen.slice(0, 200) : alleen

  const parameters = new URLSearchParams(zoekreeks.replace(/^\?/, ''))
  const houden = new URLSearchParams()
  for (const naam of BEWAARDE_PARAMETERS) {
    const waarde = parameters.get(naam)
    if (waarde) houden.set(naam, waarde.slice(0, 40))
  }

  const staart = houden.toString()
  return staart ? `${kort}?${staart}` : kort
}

/** Alleen telefoon, tablet of computer, op schermbreedte. */
export function apparaatVanBreedte(breedte: number): MeetApparaat {
  if (breedte < 640) return 'telefoon'
  if (breedte < 1024) return 'tablet'
  return 'computer'
}

/**
 * Het domein van de verwijzer, bijvoorbeeld `google.com`. Nooit het hele
 * adres. Komt de bezoeker van de site zelf, dan is er geen verwijzer.
 */
export function verwijzerDomein(verwijzer: string, eigenHost: string): string | null {
  if (!verwijzer) return null
  let host: string
  try {
    host = new URL(verwijzer).hostname
  } catch {
    return null
  }
  if (!host) return null
  const kaal = host.replace(/^www\./, '')
  if (kaal === eigenHost.replace(/^www\./, '')) return null
  return kaal.slice(0, 80)
}

/**
 * `?utm_source=` van de landingspagina, in kleine letters. Komt de bezoeker
 * zonder die parameter binnen, dan is er niets te melden.
 */
export function utmBron(zoekreeks: string): string | null {
  const parameters = new URLSearchParams(zoekreeks.replace(/^\?/, ''))
  const waarde = parameters.get('utm_source')?.trim().toLowerCase()
  return waarde ? waarde.slice(0, 80) : null
}

const BOTS =
  /bot|crawl|spider|slurp|headless|preview|lighthouse|pingdom|monitor|curl|wget|python-requests|facebookexternalhit|embedly|quora link preview|whatsapp|telegrambot/i

/** Grof filter op bekende crawlers. Een echte leerling komt hier niet door. */
export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true
  return BOTS.test(userAgent)
}

/** Op beheerpagina's meten we niets. */
export function slaPadOver(pad: string): boolean {
  return pad === '/admin' || pad.startsWith('/admin/')
}

/**
 * Een korte, vaste tekst bij een knop of link. Nooit uit een invoerveld, en
 * nooit iets wat op een e-mailadres lijkt.
 */
export function korteTekst(tekst: string | null | undefined): string | null {
  if (!tekst) return null
  const een = tekst.replace(/\s+/g, ' ').trim()
  if (!een) return null
  if (een.includes('@')) return null
  return een.length > 40 ? `${een.slice(0, 40)}…` : een
}

/**
 * De naam waaronder een klik in de tabel komt: bij voorkeur de vaste naam
 * uit `data-meet`, anders het soort element plus een korte tekst.
 */
export function doelNaam(
  dataMeet: string | null | undefined,
  element: string,
  tekst: string | null | undefined,
): string | null {
  const vast = dataMeet?.trim()
  if (vast) return vast.slice(0, 80)

  const kort = korteTekst(tekst)
  const soort = element.toLowerCase()
  return kort ? `${soort}:${kort}`.slice(0, 80) : soort.slice(0, 80)
}

export type Klikplek = {
  x: number
  y: number
  t: number
  /**
   * Stond deze klik op een tekstveld? Twee of drie snelle kliks daar zijn
   * meestal een leerling die een woord of regel selecteert om een typefout
   * te verbeteren, geen teken van frustratie zoals bij een knop die niet
   * reageert. Zulke kliks tellen niet mee voor een woedeklik.
   */
  opTekstveld?: boolean
}

/** Drie of meer kliks binnen één seconde, op ongeveer dezelfde plek. */
export function isWoedeklik(kliks: readonly Klikplek[]): boolean {
  if (kliks.length < 3) return false
  const laatste = kliks[kliks.length - 1]
  if (laatste.opTekstveld) return false
  const dichtbij = kliks.filter(
    (klik) =>
      !klik.opTekstveld &&
      laatste.t - klik.t <= 1000 &&
      Math.abs(klik.x - laatste.x) <= 30 &&
      Math.abs(klik.y - laatste.y) <= 30,
  )
  return dichtbij.length >= 3
}

/**
 * Eén rij uit een verzending nakijken en opschonen. Geeft `null` terug zodra
 * er iets niet klopt; zo komt er nooit iets onverwachts in de database.
 */
export function geldigeGebeurtenis(ruw: unknown): Gebeurtenis | null {
  if (typeof ruw !== 'object' || ruw === null) return null
  const rij = ruw as Record<string, unknown>

  const sessie = typeof rij.sessie_id === 'string' ? rij.sessie_id : ''
  if (!isGeldigeUuid(sessie)) return null

  const soort = rij.soort
  if (typeof soort !== 'string' || !(BROWSER_SOORTEN as readonly string[]).includes(soort)) {
    return null
  }

  const apparaat = rij.apparaat
  if (
    typeof apparaat !== 'string' ||
    !(MEET_APPARATEN as readonly string[]).includes(apparaat)
  ) {
    return null
  }

  if (typeof rij.pad !== 'string' || !rij.pad.startsWith('/')) return null
  const pad = schoonPad(rij.pad)
  if (slaPadOver(pad)) return null

  const waarde =
    typeof rij.waarde === 'number' &&
    (SCROLL_STAPPEN as readonly number[]).includes(rij.waarde)
      ? rij.waarde
      : null

  return {
    sessie_id: sessie.toLowerCase(),
    soort: soort as MeetSoort,
    pad,
    doel: typeof rij.doel === 'string' ? korteTekst(rij.doel.slice(0, 80)) : null,
    waarde: soort === 'scroll' ? waarde : null,
    apparaat: apparaat as MeetApparaat,
    verwijzer:
      typeof rij.verwijzer === 'string' && rij.verwijzer
        ? rij.verwijzer.slice(0, 80)
        : null,
    utm_source:
      typeof rij.utm_source === 'string' && rij.utm_source
        ? rij.utm_source.slice(0, 80)
        : null,
    ingelogd: rij.ingelogd === true,
  }
}

/** Een hele verzending nakijken: hoogstens één tabblad, hoogstens 40 rijen. */
export function geldigeZending(ruw: unknown): Gebeurtenis[] {
  if (!Array.isArray(ruw)) return []
  const rijen: Gebeurtenis[] = []
  for (const item of ruw.slice(0, MAX_PER_ZENDING)) {
    const rij = geldigeGebeurtenis(item)
    if (!rij) continue
    if (rijen.length && rij.sessie_id !== rijen[0].sessie_id) continue
    rijen.push(rij)
  }
  return rijen
}
