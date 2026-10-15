import { veiligOefenpad } from './oefenpad'

/**
 * De knop "Doorgaan met Google" blijft weg tot Aaf de provider heeft
 * aangezet. Alleen de waarde `1` telt; iets anders (leeg, `true`, `ja`)
 * laat de knop uit.
 */
export function googleLoginAan(
  waarde: string | undefined = process.env.NEXT_PUBLIC_GOOGLE_LOGIN,
): boolean {
  return waarde === '1'
}

type NaamGebruiker = {
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
  identities?: { provider?: string }[] | null
}

function komtVanGoogle(user: NaamGebruiker): boolean {
  if (user.app_metadata?.provider === 'google') return true
  const providers = user.app_metadata?.providers
  if (Array.isArray(providers) && providers.includes('google')) return true
  return (user.identities ?? []).some((id) => id.provider === 'google')
}

/**
 * Eerste keer via Google, en er is nog geen gebruikersnaam gekozen of
 * overgeslagen. Een account met e-mail en wachtwoord blijft hier buiten:
 * die naam is optioneel en wordt niet alsnog gevraagd.
 */
export function moetNaamVragen(user: NaamGebruiker): boolean {
  if (!komtVanGoogle(user)) return false
  const meta = user.user_metadata ?? {}
  if (meta.google_naam_gevraagd === true) return false
  const naam = meta.username
  if (typeof naam === 'string' && naam.trim() !== '') return false
  return true
}

/** Waar Google de leerling na het inloggen naartoe stuurt. */
export function googleCallbackAdres(origin: string, ruwPad: unknown): string {
  const url = new URL('/auth/callback', origin.replace(/\/+$/, ''))
  url.searchParams.set('via', 'google')
  const pad = veiligOefenpad(ruwPad)
  url.searchParams.set('next', pad ?? '/dashboard')
  return url.toString()
}

/** `access_denied` is "annuleren" bij Google. Al het andere is een mislukking. */
export function googleFoutSleutel(
  fout: string | null,
): 'google_afgebroken' | 'auth_callback_failed' {
  return fout === 'access_denied' ? 'google_afgebroken' : 'auth_callback_failed'
}

/**
 * Op deze paden sturen we niet door naar de naamvraag: de terugkeer van
 * Google, uitloggen, de API, en de pagina zelf (anders wordt het een lus).
 */
export function padZonderNaamvraag(pad: string): boolean {
  if (
    pad.startsWith('/api') ||
    pad.startsWith('/auth') ||
    pad.startsWith('/uitloggen') ||
    pad === '/nl/gebruikersnaam' ||
    pad.startsWith('/nl/gebruikersnaam/') ||
    pad === '/gebruikersnaam' ||
    pad.startsWith('/gebruikersnaam/')
  ) {
    return true
  }
  return false
}

/**
 * Adres van de naamvraag. Een gekozen soort som gaat mee als `naar`.
 * Een ander pad (dashboard, inloggen) niet.
 */
export function gebruikersnaamBestemming(padZonderTaal: string, zoek: string): string {
  const url = new URL('/nl/gebruikersnaam', 'https://afgeleideoefenen.nl')
  const params = new URLSearchParams(zoek.startsWith('?') ? zoek.slice(1) : zoek)
  const pad =
    veiligOefenpad(params.get('naar')) ?? veiligOefenpad(`${padZonderTaal}${zoek}`)
  if (pad) url.searchParams.set('naar', pad)
  return `${url.pathname}${url.search}`
}
