import type { MetadataRoute } from 'next'

import { SITE_CONFIG } from '@/config/site'
import { routing } from '@/i18n/routing'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_CONFIG.domain}`

// Deze pagina's staan in `src/app/[locale]`, dus hun echte adres begint met
// een taalcode: /nl/dashboard, /nl/oefenen, enzovoort.
const PERSOONLIJK_MET_TAALCODE = [
  'dashboard',
  'oefenen',
  'zelf-toets',
  'instellingen',
  'feedback',
  'inloggen',
  'registreren',
]

// Deze adressen staan in `src/app` zelf en hebben dus geen taalcode — zie
// `ZONDER_TAALCODE` in `src/proxy.ts`.
const ZONDER_TAALCODE = ['/api/', '/admin', '/admin/', '/uitloggen', '/auth/']

export default function robots(): MetadataRoute.Robots {
  const metTaalcode = routing.locales.flatMap((taal) =>
    PERSOONLIJK_MET_TAALCODE.map((pad) => `/${taal}/${pad}`),
  )

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Persoonlijke en admin-pagina's niet in de index.
        disallow: [...ZONDER_TAALCODE, ...metTaalcode],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
