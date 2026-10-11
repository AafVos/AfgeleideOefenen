import { headers } from 'next/headers'

import { SITE_URL } from '@/lib/seo'

/**
 * Het volledige adres van de site, zoals de leerling hem op dit moment
 * bereikt.
 *
 * Gebruik dit voor de links die in e-mails staan (bevestigingsmail,
 * wachtwoord opnieuw). Supabase weigert een onvolledig adres — een los pad
 * zonder domein — en valt dan stilletjes terug op de site-url, waardoor de
 * leerling na het klikken op de verkeerde pagina uitkomt.
 *
 * Eerst de `origin`-header (die is al een volledig adres), dan de host met
 * `https://` ervoor, en als ook die ontbreekt het adres uit de config.
 */
export async function bepaalAanvraagAdres(): Promise<string> {
  const headersList = await headers()
  const origin = headersList.get('origin')
  if (origin) return zonderSlash(origin)

  const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
  if (host) return `https://${zonderSlash(host)}`

  return SITE_URL
}

/** Haalt een losse schuine streep aan het eind weg ("https://site.nl/"). */
function zonderSlash(adres: string): string {
  return adres.replace(/\/+$/, '')
}