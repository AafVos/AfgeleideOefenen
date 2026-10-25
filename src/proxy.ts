import { NextResponse, type NextRequest } from 'next/server'

import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/middleware'
import { oudVideoAdres } from '@/lib/videos'

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
  'og',
]

// Openbare pagina's met voor iedereen dezelfde inhoud. Next geeft elke
// pagina die hij per bezoek opbouwt `no-store` mee, en daarmee weigert de
// browser hem in zijn terug-cache te zetten: de terugknop bouwt de hele
// pagina dan opnieuw op in plaats van hem terug te zetten zoals hij was.
// Voor deze pagina's hoeft dat niet. Ze blijven wel `private` — de kop
// noemt de naam van wie is ingelogd, dus een gedeelde cache mag ze niet
// bewaren — en `no-cache` zorgt dat de browser bij een gewoon bezoek altijd
// eerst bij de server navraagt.
//
// `/theorie` staat er ook in. Een bezoeker zonder account krijgt die pagina
// als los bestand van Cloudflare en komt hier niet langs; een ingelogde
// leerling wel, via `/nl/theorie/.../persoonlijk`. De worker haalt
// `/persoonlijk` eraf voordat Next de pagina opbouwt, maar beide vormen
// vallen hieronder.
//
// `/voorbeeld` staat er sinds AFG-527 ook in: de antwoordpagina's waar
// leerlingen op zoeken (AFG-304) hebben `generateStaticParams` en voor
// iedereen dezelfde inhoud, maar kregen nog `no-store` mee.
const TERUGKNOP_PADEN = [
  '/hoe-het-werkt',
  '/privacy',
  '/theorie',
  '/uitleg-videos',
  '/voorbeeld',
]
const TERUGKNOP_CACHE = 'private, no-cache, max-age=0, must-revalidate'

/** `/nl/uitleg-videos/kettingregel` → ja; `/nl/dashboard` → nee. */
function magInTerugCache(pathname: string) {
  const pad = pathname.startsWith(`/${TAAL}/`)
    ? pathname.slice(`/${TAAL}`.length)
    : pathname
  return TERUGKNOP_PADEN.some((p) => pad === p || pad.startsWith(`${p}/`))
}

// Dit heette tot nu toe `middleware.ts`. Next.js 16 heeft die naam afgekeurd
// en vraagt om `proxy.ts`. Gevolg van de nieuwe naam: dit draait altijd op
// Node (een `runtime`-instelling mag hier niet meer staan), dus op Workers
// wordt het een aparte Node-bundel in plaats van de lichtere edge-versie.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Het WhatsApp-plaatje heeft geen sessie nodig.
  if (pathname === '/og') {
    return NextResponse.next()
  }

  // Video's die vroeger op het somnummer stonden. Eén sprong naar het nieuwe adres.
  const nieuwVideoAdres = oudVideoAdres(pathname)
  if (nieuwVideoAdres) {
    const url = request.nextUrl.clone()
    url.pathname = nieuwVideoAdres
    return NextResponse.redirect(url, 308)
  }

  // De site was ooit ook Engels. Oude /en-adressen blijven werken: ze gaan
  // permanent (301) naar dezelfde pagina onder /nl.
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/${TAAL}${pathname.slice('/en'.length)}`
    return NextResponse.redirect(url, 301)
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
  // Status 301 (niet 308): zo blijft het één permanente sprong naar de
  // echte startpagina, in plaats van een tussenstap die Google als eigen
  // resultaat kan vasthouden.
  if (
    eerste !== TAAL &&
    eerste !== '_next' &&
    !ZONDER_TAALCODE.includes(eerste)
  ) {
    const url = request.nextUrl.clone()
    url.pathname = pathname === '/' ? `/${TAAL}` : `/${TAAL}${pathname}`
    return NextResponse.redirect(url, 301)
  }

  const antwoord = await updateSession(request)

  // Alleen als de pagina echt wordt opgebouwd. Een doorverwijzing naar het
  // inlogscherm houdt zijn eigen koppen.
  if (antwoord.status === 200 && magInTerugCache(pathname)) {
    antwoord.headers.set('cache-control', TERUGKNOP_CACHE)
  }

  return antwoord
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
