import { Resend } from 'resend'

/**
 * Geeft een Resend-client terug, of `null` als RESEND_API_KEY ontbreekt.
 *
 * `new Resend(undefined)` gooit meteen "Missing API key". Dat mag dus nooit op
 * modulenivo gebeuren: Next.js laadt route- en actiebestanden al tijdens
 * `next build`, en dan stopt de bouw op een computer zonder mailsleutel.
 *
 * De aanroeper beslist wat er gebeurt zonder sleutel: bij iets wat een leerling
 * zelf verstuurt een nette melding op het scherm, bij een seintje aan onszelf
 * één regel in de serverlog en verder niets.
 */
export function maakMailer(): Resend | null {
  const sleutel = process.env.RESEND_API_KEY?.trim()
  return sleutel ? new Resend(sleutel) : null
}
