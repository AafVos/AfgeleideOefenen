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

const STATISCHE_PADEN: Record<string, 'start' | 'theorie'> = {
  '/nl': 'start',
  '/nl/': 'start',
  '/nl/theorie': 'theorie',
  '/nl/theorie/': 'theorie',
}

/**
 * Een openbare pagina die al als bestand klaarstaat, voor iemand zonder
 * sessie. `null` als de zware server toch moet starten: een ander adres,
 * een zoekopdracht, een app-verzoek of een ingelogde leerling.
 */
export function anoniemeStatischePagina(
  request: Request,
): 'start' | 'theorie' | null {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null

  const url = new URL(request.url)
  const welke = STATISCHE_PADEN[url.pathname]
  if (!welke) return null
  if (url.search !== '') return null

  for (const kop of APP_KOPPEN) {
    if (request.headers.has(kop)) return null
  }

  const header = request.headers.get('cookie')
  if (!header) return welke

  const koekjes = header.split(';').map((deel) => ({
    name: deel.split('=')[0]?.trim() ?? '',
  }))
  return heeftSessiekoekje(koekjes) ? null : welke
}

/**
 * De startpagina voor iemand zonder sessie. Die versie staat al klaar als
 * bestand, zodat de zware server niet hoeft te starten.
 */
export function anoniemeStartpagina(request: Request): boolean {
  return anoniemeStatischePagina(request) === 'start'
}
