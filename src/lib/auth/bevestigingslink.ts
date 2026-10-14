import { bepaalAanvraagAdres } from '@/lib/aanvraag-adres'

import { veiligOefenpad } from './oefenpad'

/**
 * De link in de bevestigingsmail. Zonder gekozen soort komt de leerling
 * via de inlog-bestemming op zijn eerste opgave. Mét een oefenpad wijst
 * de mail daarheen. Een ander pad gaat niet mee.
 */
export async function bevestigingsRedirect(ruwPad: unknown, locale: string): Promise<string> {
  const pad = veiligOefenpad(ruwPad)
  const next = pad ?? `/${locale}/inloggen`
  return `${await bepaalAanvraagAdres()}/auth/callback?next=${encodeURIComponent(next)}`
}
