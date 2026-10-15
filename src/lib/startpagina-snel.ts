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

/**
 * De startpagina voor iemand zonder sessie. Die versie staat al klaar als
 * bestand, zodat de zware server niet hoeft te starten.
 */
export function anoniemeStartpagina(request: Request): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false

  const url = new URL(request.url)
  if (url.pathname !== '/nl' && url.pathname !== '/nl/') return false
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
