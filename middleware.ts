import createMiddleware from 'next-intl/middleware'

import { routing } from './src/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except admin, api, auth, uitloggen, and static files
  matcher: [
    '/((?!admin|api|auth|uitloggen|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
