import { SITE_CONFIG } from '@/config/site'

/**
 * Afzender: zet EMAIL_FROM zodra het eigen domein in Resend geverifieerd is;
 * tot die tijd valt dit terug op het domein van de site.
 */
export const EMAIL_FROM = process.env.EMAIL_FROM ?? `no-reply@${SITE_CONFIG.domain}`

/**
 * Het adres waar berichten van leerlingen heen gaan: een vraag via Aaf,
 * feedback, een video-verzoek en het seintje bij een nieuwe gebruiker.
 *
 * Staat bewust niet in de code — deze repo is openbaar en per omgeving mag het
 * adres verschillen. Zonder NOTIFY_EMAIL gaat er dus niets uit; de aanroeper
 * vertelt de leerling dan dat het versturen niet lukte.
 */
export function meldAdres(): string | null {
  const adres = process.env.NOTIFY_EMAIL?.trim()
  return adres ? adres : null
}
