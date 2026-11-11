import { SITE_CONFIG } from '@/config/site'
import { DIFFERENTIEERREGELS_PAD, DIFFERENTIEERREGELS_TITEL } from '@/content/theory/differentieerregels'
import { EXAMENTRAINING_PAD, EXAMENTRAINING_TITEL } from '@/content/theory/examentraining'
import { EXTREME_WAARDEN_PAD, EXTREME_WAARDEN_TITEL } from '@/content/theory/extreme-waarden'
import { KETTINGREGEL_PAD, KETTINGREGEL_TITEL } from '@/content/theory/kettingregel'
import { MACHTSREGEL_PAD, MACHTSREGEL_TITEL } from '@/content/theory/machtsregel'
import { PRODUCTREGEL_PAD, PRODUCTREGEL_TITEL } from '@/content/theory/productregel'
import { QUOTIENTREGEL_PAD, QUOTIENTREGEL_TITEL } from '@/content/theory/quotientregel'
import { RAAKLIJN_PAD, RAAKLIJN_TITEL } from '@/content/theory/raaklijn'
import { SOMREGEL_PAD, SOMREGEL_TITEL } from '@/content/theory/somregel'
import { getVoorbeeld, voorbeeldPad } from '@/content/voorbeelden'
import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/lib/seo'

const TAAL = routing.defaultLocale

// Alleen openbare pagina's: geen `/oefenen` of andere adressen uit
// `PERSOONLIJK_MET_TAALCODE` in `robots.ts`. Theorie- en voorbeeldpagina's
// zijn voor iedereen hetzelfde, zonder account.
const THEORIE = [
  { pad: DIFFERENTIEERREGELS_PAD, titel: DIFFERENTIEERREGELS_TITEL },
  { pad: SOMREGEL_PAD, titel: SOMREGEL_TITEL },
  { pad: MACHTSREGEL_PAD, titel: MACHTSREGEL_TITEL },
  { pad: PRODUCTREGEL_PAD, titel: PRODUCTREGEL_TITEL },
  { pad: QUOTIENTREGEL_PAD, titel: QUOTIENTREGEL_TITEL },
  { pad: KETTINGREGEL_PAD, titel: KETTINGREGEL_TITEL },
  { pad: RAAKLIJN_PAD, titel: RAAKLIJN_TITEL },
  { pad: EXTREME_WAARDEN_PAD, titel: EXTREME_WAARDEN_TITEL },
]

// De voorbeelden waar leerlingen het meest op zoeken (AFG-740).
const TOP_VOORBEELDEN = [
  'ln-x',
  'een-gedeeld-door-x',
  'sin-x',
  'cos-x',
  'e-tot-de-x',
  'e-tot-de-2x',
  'wortel-x',
]

function adres(pad: string): string {
  return `${SITE_URL}/${TAAL}${pad}`
}

function lijst(regels: { titel: string; url: string; omschrijving?: string }[]): string {
  return regels
    .map(({ titel, url, omschrijving }) =>
      omschrijving ? `- [${titel}](${url}): ${omschrijving}` : `- [${titel}](${url})`,
    )
    .join('\n')
}

export function GET() {
  // De sjabloon dekt nu alleen afgeleideoefenen.nl (AFG-740); wiskundemetaaf.nl
  // krijgt een eigen versie in een apart ticket (WIS-6).
  if (SITE_CONFIG.variant !== 'afgeleide') {
    return new Response('Not found', { status: 404 })
  }

  const theorie = lijst(THEORIE.map(({ pad, titel }) => ({ titel, url: adres(pad) })))

  const voorbeelden = lijst(
    TOP_VOORBEELDEN.map((slug) => getVoorbeeld(slug))
      .filter((voorbeeld) => voorbeeld !== null)
      .map((voorbeeld) => ({ titel: voorbeeld.kop, url: adres(voorbeeldPad(voorbeeld.slug)) })),
  )

  const tekst = `# ${SITE_CONFIG.brandNaam}

> Gratis oefenen met de afgeleide (differentiëren) voor vwo wiskunde B: drie sommen zonder account, met uitleg bij elke fout.

## Start

${lijst([
  { titel: 'Start met oefenen', url: adres(''), omschrijving: 'kies een hoofdstuk en maak gratis drie sommen, zonder account' },
  { titel: EXAMENTRAINING_TITEL, url: adres(EXAMENTRAINING_PAD), omschrijving: 'oefen met echte eindexamenvragen wiskunde B' },
])}

## Theorie

${theorie}

## Veelgezochte voorbeelden

${voorbeelden}

## Meer oefenen

${lijst([
  { titel: 'Integraal oefenen', url: 'https://integraaloefenen.nl/?van=afgeleideoefenen', omschrijving: 'gratis oefenen met primitieven en integralen voor wiskunde B' },
  { titel: 'Wiskunde met Aaf', url: 'https://www.wiskundemetaaf.nl', omschrijving: 'eindexamentraining vwo wiskunde B met echte examenvragen' },
  { titel: 'Wiskunde met Aaf op YouTube', url: 'https://www.youtube.com/@WiskundeMetAaf', omschrijving: "uitlegvideo's bij de afgeleide en het eindexamen" },
])}
`

  return new Response(tekst, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
