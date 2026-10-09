import { NextResponse, type NextRequest } from 'next/server'

import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/middleware'

const TAAL = routing.defaultLocale

// Deze adressen staan in `src/app` zelf en niet in `src/app/[locale]`. Ze
// horen dus zonder taalcode te blijven.
const ZONDER_TAALCODE = [
  'admin',
  'api',
  'auth',
  'uitloggen',
  'robots.txt',
  'sitemap.xml',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // De site was ooit ook Engels. Oude /en-adressen blijven werken: ze gaan
  // permanent naar dezelfde pagina onder /nl.
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/${TAAL}${pathname.slice('/en'.length)}`
    return NextResponse.redirect(url, 308)
  }

  const [, eerste = '', tweede = ''] = pathname.split('/')

  // /nl/admin bestaat niet; die pagina's staan buiten de taalcode.
  if (eerste === TAAL && ZONDER_TAALCODE.includes(tweede)) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(`/${TAAL}`.length)
    return NextResponse.redirect(url)
  }

  // Een adres zonder taalcode — een gedeelde link, een adres uit de sitemap,
  // of gewoon / — krijgt /nl ervoor, anders loopt het dood op een 404.
  if (
    eerste !== TAAL &&
    eerste !== '_next' &&
    !ZONDER_TAALCODE.includes(eerste)
  ) {
    const url = request.nextUrl.clone()
    url.pathname = pathname === '/' ? `/${TAAL}` : `/${TAAL}${pathname}`
    return NextResponse.redirect(url)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, fonts
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)',
  ],
}
