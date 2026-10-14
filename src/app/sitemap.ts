import type { MetadataRoute } from 'next'

import { EXAMENTRAINING_PAD } from '@/content/theory/examentraining'
import { EXTREME_WAARDEN_PAD } from '@/content/theory/extreme-waarden'
import { KETTINGREGEL_PAD } from '@/content/theory/kettingregel'
import { MACHTSREGEL_PAD } from '@/content/theory/machtsregel'
import { PRODUCTREGEL_PAD } from '@/content/theory/productregel'
import { QUOTIENTREGEL_PAD } from '@/content/theory/quotientregel'
import { RAAKLIJN_PAD } from '@/content/theory/raaklijn'
import { SOMREGEL_PAD } from '@/content/theory/somregel'
import { getVoorbeelden, voorbeeldPad } from '@/content/voorbeelden'
import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/lib/seo'
import { getUitlegVideos, uitlegVideoPad } from '@/lib/videos'

// De pagina's staan in `src/app/[locale]`, dus hun echte adres begint met een
// taalcode. Zonder taalcode werkt het ook, maar via een doorverwijzing — en in
// een sitemap hoort het adres te staan waar de pagina zelf op antwoordt.
const TAAL = routing.defaultLocale

// Alleen pagina's die een zoekmachine mag bezoeken. De persoonlijke pagina's
// (en ook inloggen en registreren) staan in `robots.ts` op niet-bezoeken, dus
// die horen hier niet bij.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    {
      url: `${SITE_URL}/${TAAL}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/${TAAL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/${TAAL}/hoe-het-werkt`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/${TAAL}/theorie`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/${TAAL}${KETTINGREGEL_PAD}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/${TAAL}${PRODUCTREGEL_PAD}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/${TAAL}${QUOTIENTREGEL_PAD}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/${TAAL}${SOMREGEL_PAD}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/${TAAL}${MACHTSREGEL_PAD}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/${TAAL}${RAAKLIJN_PAD}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/${TAAL}${EXTREME_WAARDEN_PAD}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/${TAAL}${EXAMENTRAINING_PAD}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/${TAAL}/uitleg-videos`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...getUitlegVideos().map((video) => ({
      url: `${SITE_URL}/${TAAL}${uitlegVideoPad(video.slug)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...getVoorbeelden().map((voorbeeld) => ({
      url: `${SITE_URL}/${TAAL}${voorbeeldPad(voorbeeld.slug)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
