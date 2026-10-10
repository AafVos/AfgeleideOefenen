import type { Metadata } from 'next'

import { SITE_CONFIG } from '@/config/site'

/**
 * Het adres waar de site echt staat.
 *
 * `afgeleideoefenen.nl` stuurt door naar `www.afgeleideoefenen.nl`. Alles wat
 * een zoekmachine leest — de canonieke link, de sitemap en de `Host` in
 * robots.txt — noemt daarom meteen het www-adres, zodat er geen doorverwijzing
 * meer tussen zit.
 */
export const SITE_URL = bepaalSiteUrl()

function bepaalSiteUrl(): string {
  const metWww = `https://www.${SITE_CONFIG.domain}`
  const uitOmgeving = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '')
  if (!uitOmgeving) return metWww
  // Staat er nog het adres zonder www ingesteld, dan is dat een doorverwijzing
  // naar www. Noem dan meteen waar de pagina echt staat.
  if (uitOmgeving === `https://${SITE_CONFIG.domain}`) return metWww
  return uitOmgeving
}

/**
 * De canonieke link van één pagina: haar eigen adres, mét taalcode.
 *
 * Elke pagina moet dit zelf zetten. Doet ze dat niet, dan heeft ze geen
 * canonieke link — en dat is beter dan het adres van een andere pagina, want
 * dan vertelt ze Google dat ze een dubbele versie daarvan is.
 *
 * `canoniek('nl', '/theorie')` → `https://www.afgeleideoefenen.nl/nl/theorie`
 */
export function canoniek(locale: string, pad = ''): Metadata['alternates'] {
  return { canonical: `${SITE_URL}/${locale}${pad}` }
}
