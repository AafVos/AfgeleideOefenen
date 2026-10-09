import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/middleware'

const intlMiddleware = createMiddleware(routing)

// Deze pagina's staan buiten src/app/[locale] en hebben dus geen taalcode.
const NON_LOCALIZED_PREFIXES = ['admin', 'api', 'auth', 'uitloggen']

const LOCALE_PREFIXED_NON_LOCALIZED = new RegExp(
  `^/(?:${routing.locales.join('|')})/(${NON_LOCALIZED_PREFIXES.join('|')})(/.*)?$`,
)

function isNonLocalized(pathname: string) {
  return NON_LOCALIZED_PREFIXES.some(
    (prefix) => pathname === `/${prefix}` || pathname.startsWith(`/${prefix}/`),
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /nl/admin → /admin: die pagina's bestaan maar één keer, zonder taalcode.
  const prefixed = pathname.match(LOCALE_PREFIXED_NON_LOCALIZED)
  if (prefixed) {
    const url = request.nextUrl.clone()
    url.pathname = `/${prefixed[1]}${prefixed[2] ?? ''}`
    return NextResponse.redirect(url)
  }

  // Ververst de Supabase-sessie. Dit werkt ook de cookies op `request` bij, dus
  // dit moet vóór de taal-afhandeling: die geeft de bijgewerkte cookies door
  // aan de pagina.
  const sessionResponse = await updateSession(request)
  if (sessionResponse.headers.has('location')) {
    return sessionResponse
  }

  if (isNonLocalized(pathname)) {
    return sessionResponse
  }

  // Stuurt /zelf-toets door naar /nl/zelf-toets en zet de taal voor de pagina.
  const intlResponse = intlMiddleware(request)
  for (const cookie of sessionResponse.cookies.getAll()) {
    intlResponse.cookies.set(cookie)
  }
  return intlResponse
}

export const config = {
  matcher: [
    /*
     * Alles behalve:
     * - _next/static en _next/image (vaste bestanden en plaatjes)
     * - robots.txt en sitemap.xml (horen zonder taalcode)
     * - favicon, plaatjes en lettertypen
     */
    '/((?!_next/static|_next/image|robots\\.txt|sitemap\\.xml|.*\\.(?:ico|svg|png|jpg|jpeg|gif|webp|woff2?)$).*)',
  ],
}
