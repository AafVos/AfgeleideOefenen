import type { Metadata } from 'next'

import { SITE_CONFIG, type SiteVariant } from '@/config/site'
import { DEELPLAATJE } from '@/lib/deelplaatje'

/**
 * Het adres waar de site echt staat.
 *
 * `afgeleideoefenen.nl` stuurt door naar `www.afgeleideoefenen.nl`. Alles wat
 * een zoekmachine leest — de canonieke link, de sitemap en de `Host` in
 * robots.txt — noemt daarom meteen het www-adres, zodat er geen doorverwijzing
 * meer tussen zit.
 */
export const SITE_URL = bepaalSiteUrl()

/**
 * Deeltitel en tekst van de startpagina, per site. Andere pagina's zetten
 * hun eigen titel en tekst.
 */
const START_TEKST = {
  afgeleide: {
    titel: 'Differentiëren oefenen — wiskunde B VWO',
    tekst:
      'Differentiëren oefenen voor wiskunde B VWO: maak gratis drie sommen zonder account, met uitleg bij elke fout. Oefen de afgeleide met de machtsregel, productregel, quotiëntregel, kettingregel, goniometrie, e-macht en ln.',
    paginaTitel: 'Differentiëren oefenen — afgeleide wiskunde B VWO',
  },
  wiskundemetaaf: {
    titel: 'Eindexamen vwo wiskunde B oefenen met echte examenvragen en uitleg',
    tekst:
      'Eindexamen vwo wiskunde B oefenen met echte examenvragen en uitleg. Je ziet wanneer het examen is, oefent vragen uit oude examens en vraagt zelf een uitlegvideo aan bij de vraag die je niet snapt.',
    paginaTitel: 'Eindexamen vwo wiskunde B oefenen met echte examenvragen en uitleg',
  },
} as const satisfies Record<SiteVariant, { titel: string; tekst: string; paginaTitel: string }>

export const DEEL_TITEL_START: string = START_TEKST[SITE_CONFIG.variant].titel
export const DEEL_TEKST_START: string = START_TEKST[SITE_CONFIG.variant].tekst
/** De titel in het tabblad als een pagina er zelf geen zet. */
export const TITEL_STANDAARD: string = START_TEKST[SITE_CONFIG.variant].paginaTitel

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
 * Het echte adres van één pagina, mét www en mét taalcode.
 *
 * `paginaAdres('nl', '/theorie')` → `https://www.afgeleideoefenen.nl/nl/theorie`
 */
export function paginaAdres(locale: string, pad = ''): string {
  return `${SITE_URL}/${locale}${pad}`
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
  return { canonical: paginaAdres(locale, pad) }
}

/**
 * Voor pagina's die al in `src/app/robots.ts` buiten de index staan.
 *
 * Die blokkade via robots.txt wordt niet door elke crawler gevolgd, dus zet
 * dit er ook zelf bij. Elke pagina hierin moet dit zelf zetten, net als
 * `canoniek`.
 */
export function nietIndexeren(): Metadata['robots'] {
  return { index: false, follow: true }
}

/**
 * Het deel-kaartje van één openbare pagina: titel, korte tekst en hetzelfde
 * adres als de canonieke link. Zonder dit veld toont een gedeelde link de
 * tekst van de startpagina.
 */
export function deelkaart(
  locale: string,
  pad = '',
  inhoud?: { title: string; description: string },
): NonNullable<Metadata['openGraph']> {
  return {
    url: paginaAdres(locale, pad),
    ...(inhoud
      ? {
          title: inhoud.title,
          description: inhoud.description,
          images: [
            {
              url: `/og?titel=${encodeURIComponent(inhoud.title)}`,
              width: DEELPLAATJE.width,
              height: DEELPLAATJE.height,
              alt: inhoud.title,
            },
          ],
        }
      : {}),
  }
}
