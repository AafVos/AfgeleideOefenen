/**
 * Het pad dat een leerling koos vóór hij een account had.
 *
 * Alleen een pad op deze site dat met `/oefenen` begint. Geen ander pad,
 * geen adres buiten de site, en geen cookie: het staat in de adresregel
 * en in het formulier, en wordt bij elk gebruik opnieuw gecontroleerd.
 */

export const OEFENPAD_PARAM = 'naar'

const HERKOMST = 'https://afgeleideoefenen.nl'
const MAX_LENGTE = 500

/** Een veilig oefenpad, of `null` als de tekst iets anders is. */
export function veiligOefenpad(ruw: unknown): string | null {
  const waarde = Array.isArray(ruw) ? ruw[0] : ruw
  if (typeof waarde !== 'string') return null
  if (/[\u0000-\u001f\u007f]/.test(waarde)) return null

  const tekst = waarde.trim()
  if (tekst.length === 0 || tekst.length > MAX_LENGTE) return null
  if (!tekst.startsWith('/') || tekst.startsWith('//') || tekst.includes('\\')) return null

  let url: URL
  try {
    url = new URL(tekst, HERKOMST)
  } catch {
    return null
  }
  if (url.origin !== HERKOMST || url.username || url.password) return null

  let pad = url.pathname
  if (pad.startsWith('/nl/')) pad = pad.slice(3)
  if (pad !== '/oefenen' && !pad.startsWith('/oefenen/')) return null
  if (pad.includes('..') || pad.includes('//')) return null

  return `${pad}${url.search}`
}

/** Zet `/nl` voor een pad dat de site zonder taalcode binnenkrijgt. */
export function padMetTaal(pad: string, taal = 'nl'): string {
  if (pad === `/${taal}` || pad.startsWith(`/${taal}/`)) return pad
  return `/${taal}${pad.startsWith('/') ? pad : `/${pad}`}`
}

/** Link naar inloggen, registreren of wachtwoord vergeten, met het oefenpad eraan als dat er is. */
export function hrefMetOefenpad(
  basis: '/inloggen' | '/registreren' | '/wachtwoord-vergeten',
  pad: string | null,
): string {
  if (!pad) return basis
  return `${basis}?${OEFENPAD_PARAM}=${encodeURIComponent(pad)}`
}

/**
 * De `next` in de resetmail: de pagina voor een nieuw wachtwoord.
 * Het oefenpad zit gecodeerd in de query, zodat een `&` in het pad
 * niet uit de link valt. Een ander pad gaat niet mee.
 */
export function resetVolgende(ruwPad: unknown): string {
  const pad = veiligOefenpad(ruwPad)
  if (!pad) return '/wachtwoord-opnieuw'
  return `/wachtwoord-opnieuw?${OEFENPAD_PARAM}=${encodeURIComponent(pad)}`
}

/**
 * Het oefenpad uit een adres. Dat kan het pad zelf zijn (`/oefenen?…`)
 * of de resetpagina met `naar` in de query.
 */
export function oefenpadUitAdres(ruw: unknown): string | null {
  const direct = veiligOefenpad(ruw)
  if (direct) return direct
  const waarde = Array.isArray(ruw) ? ruw[0] : ruw
  if (typeof waarde !== 'string') return null
  const tekst = waarde.trim()
  if (!tekst.startsWith('/') || tekst.startsWith('//') || tekst.includes('\\')) return null
  try {
    const url = new URL(tekst, HERKOMST)
    if (url.origin !== HERKOMST) return null
    return veiligOefenpad(url.searchParams.get(OEFENPAD_PARAM))
  } catch {
    return null
  }
}

/**
 * Waar een uitgelogde bezoeker van een afgeschermde pagina naartoe gaat.
 * Alleen vanaf oefenen blijft het gekozen pad bewaard.
 */
export function inlogAdres(padZonderTaal: string, zoek: string): string {
  const url = new URL('/nl/inloggen', HERKOMST)
  if (padZonderTaal === '/oefenen' || padZonderTaal.startsWith('/oefenen/')) {
    const pad = veiligOefenpad(`${padZonderTaal}${zoek}`)
    if (pad) url.searchParams.set(OEFENPAD_PARAM, pad)
  }
  return `${url.pathname}${url.search}`
}
