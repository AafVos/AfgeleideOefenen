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
  // /persoonlijk is het adres waarop een ingelogde leerling de gewone
  // pagina krijgt. Daar hoort geen klaargezet bestand bij.
  if (gevonden[1] === 'persoonlijk') return null
  return gevonden[1] ? `${gevonden[1]}.html` : 'index.html'
}

// /nl/uitleg-videos. Geen diepere paden: de losse video's per slug horen
// niet bij deze snelpad-aanpak.
const UITLEG_VIDEOS_PAD = /^\/nl\/uitleg-videos\/?$/

/**
 * Geldt voor het overzicht van de uitlegvideo's zonder sessie. Die inhoud is
 * voor iedereen gelijk (geen `?video=`, zie anoniemePagina hierboven): een
 * ingelogde leerling krijgt alleen een andere kop en oefenvragen onder de
 * video, geen ander overzicht.
 */
export function anoniemeUitlegVideosPagina(request: Request): boolean {
  return anoniemePagina(request, (pathname) => UITLEG_VIDEOS_PAD.test(pathname))
}

// /nl/inloggen. Geen `?naar=`, `?error=` of `?mail=`: die bezoeken (bijv. na
// een link met een terugkeerpad) horen bij de gewone server, net als het
// adres van een ingelogde leerling (anoniemePagina sluit die al uit).
const INLOGGEN_PAD = /^\/nl\/inloggen\/?$/

/**
 * Geldt voor een kaal bezoek aan de inlogpagina zonder sessie. De pagina is
 * voor iedereen zonder sessie gelijk: wie wel een sessie heeft redirect de
 * gewone server altijd door (zie page.tsx), dus die versie hoeft hier niet
 * klaar te staan.
 */
export function anoniemeInloggenPagina(request: Request): boolean {
  return anoniemePagina(request, (pathname) => INLOGGEN_PAD.test(pathname))
}

// /nl/registreren. Geen `?van=` of `?naar=`: die bezoeken (bijv. een link
// met een herkomstcode of een terugkeerpad) horen bij de gewone server, net
// als het adres van een ingelogde leerling (anoniemePagina sluit die al
// uit).
const REGISTREREN_PAD = /^\/nl\/registreren\/?$/

/**
 * Geldt voor een kaal bezoek aan de registratiepagina zonder sessie. De
 * pagina is voor iedereen zonder sessie gelijk: wie wel een sessie heeft
 * redirect de gewone server altijd door (zie page.tsx), dus die versie
 * hoeft hier niet klaar te staan.
 */
export function anoniemeRegistrerenPagina(request: Request): boolean {
  return anoniemePagina(request, (pathname) => REGISTREREN_PAD.test(pathname))
}

// /nl/voorbeeld/wortel-x. Elk voorbeeld staat al vast via
// generateStaticParams, dus elk bestaand adres heeft een klaargezet bestand.
const VOORBEELD_PAD = /^\/nl\/voorbeeld\/([a-z0-9-]+)\/?$/

/**
 * Bestandsnaam van het klaargezette voorbeeld, of null als dit verzoek de
 * zware server nodig heeft.
 */
export function anoniemeVoorbeeldBestand(request: Request): string | null {
  if (!anoniemePagina(request, (pathname) => VOORBEELD_PAD.test(pathname))) {
    return null
  }

  const pathname = new URL(request.url).pathname
  const gevonden = VOORBEELD_PAD.exec(pathname)
  if (!gevonden) return null
  // /persoonlijk is het adres waarop een ingelogde leerling de gewone
  // pagina krijgt. Daar hoort geen klaargezet bestand bij.
  if (gevonden[1] === 'persoonlijk') return null
  return `${gevonden[1]}.html`
}

/**
 * /nl/theorie/kettingregel/persoonlijk → /nl/theorie/kettingregel, en
 * hetzelfde voor /nl/uitleg-videos en /nl/voorbeeld/<slug>. Alleen voor de
 * statische snelpad-pagina's, zodat een ingelogde leerling de gewone,
 * persoonlijke pagina krijgt en niet een los bestand.
 */
export function statischZonderPersoonlijk(pathname: string): string | null {
  if (!pathname.endsWith('/persoonlijk')) return null
  const basis = pathname.slice(0, -'/persoonlijk'.length)
  if (basis === '/nl/theorie') return basis
  if (/^\/nl\/theorie\/[a-z0-9-]+$/.test(basis)) return basis
  if (basis === '/nl/uitleg-videos') return basis
  if (/^\/nl\/voorbeeld\/[a-z0-9-]+$/.test(basis)) return basis
  return null
}
