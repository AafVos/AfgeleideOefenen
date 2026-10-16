import { heeftSessiekoekje } from '@/lib/supabase/sessie-koekje'

// Een verzoek van de app-router (voorraden, serveracties) mag niet het
// klaargezette HTML-bestand krijgen. Alleen een gewone paginabezoek.
const APP_KOPPEN = [
  'rsc',
  'next-action',
  'next-router-prefetch',
  'next-router-segment-prefetch',
  'next-router-state-tree',
]

function anoniemePagina(
  request: Request,
  pastBijPad: (pathname: string) => boolean,
): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false

  const url = new URL(request.url)
  if (!pastBijPad(url.pathname)) return false
  if (url.search !== '') return false

  for (const kop of APP_KOPPEN) {
    if (request.headers.has(kop)) return false
  }

  const header = request.headers.get('cookie')
  if (!header) return true

  const koekjes = header.split(';').map((deel) => ({
    name: deel.split('=')[0]?.trim() ?? '',
  }))
  return !heeftSessiekoekje(koekjes)
}

function isStartpad(pathname: string): boolean {
  return pathname === '/nl' || pathname === '/nl/'
}

/**
 * De startpagina voor iemand zonder sessie. Die versie staat al klaar als
 * bestand, zodat de zware server niet hoeft te starten.
 */
export function anoniemeStartpagina(request: Request): boolean {
  return anoniemePagina(request, isStartpad)
}

// /nl/theorie en /nl/theorie/kettingregel. Geen diepere paden: die horen bij
// de gewone server, net als een onbekend teken in de naam.
const THEORIE_PAD = /^\/nl\/theorie(?:\/([a-z0-9-]+))?\/?$/

/**
 * Bestandsnaam van de klaargezette theoriepagina, of null als dit verzoek
 * de zware server nodig heeft. Iemand met een sessie krijgt de gewone
 * pagina, met de kop van een ingelogde leerling.
 */
export function anoniemeTheorieBestand(request: Request): string | null {
  if (!anoniemePagina(request, (pathname) => THEORIE_PAD.test(pathname))) {
    return null
  }

  const pathname = new URL(request.url).pathname
  const gevonden = THEORIE_PAD.exec(pathname)
  if (!gevonden) return null
  return gevonden[1] ? `${gevonden[1]}.html` : 'index.html'
}
