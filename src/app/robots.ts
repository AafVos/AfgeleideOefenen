import type { MetadataRoute } from 'next'

import { SITE_CONFIG } from '@/config/site'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_CONFIG.domain}`

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Persoonlijke en admin-pagina's niet in de index.
        disallow: [
          '/api/',
          '/admin',
          '/admin/',
          '/dashboard',
          '/oefenen',
          '/onboarding',
          '/inloggen',
          '/registreren',
          '/uitloggen',
          '/auth/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
