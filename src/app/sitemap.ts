import type { MetadataRoute } from 'next'

import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/lib/seo'

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
  ]
}
