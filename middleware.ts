import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

import { routing } from './src/i18n/routing'

const intlMiddleware = createMiddleware(routing)

const NON_LOCALIZED_PREFIXES = ['admin', 'api', 'auth', 'uitloggen']

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const localeStripMatch = pathname.match(
    new RegExp(`^/(${routing.locales.join('|')})/(${NON_LOCALIZED_PREFIXES.join('|')})(/.*)?$`),
  )
  if (localeStripMatch) {
    const url = request.nextUrl.clone()
    url.pathname = `/${localeStripMatch[2]}${localeStripMatch[3] ?? ''}`
    return NextResponse.redirect(url)
  }

  const isNonLocalized = NON_LOCALIZED_PREFIXES.some(
    (prefix) => pathname === `/${prefix}` || pathname.startsWith(`/${prefix}/`),
  )
  if (isNonLocalized) {
    return NextResponse.next()
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|favicon.svg|robots.txt|sitemap.xml).*)',
  ],
}
