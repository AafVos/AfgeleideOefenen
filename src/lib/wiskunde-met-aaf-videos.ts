import { DIFFERENTIEERREGELS_OEFENEN } from '@/content/theory/differentieerregels'
import { MACHTSREGEL_OEFENEN } from '@/content/theory/machtsregel'
import { QUOTIENTREGEL_OEFENEN } from '@/content/theory/quotientregel'
import { RAAKLIJN_OEFENEN } from '@/content/theory/raaklijn'

/**
 * Video's van het YouTube-kanaal "Wiskunde met Aaf" (@WiskundeMetAaf),
 * privacyvriendelijk ingesloten via `YoutubeInsluiting` (AFG-753). Los van de
 * zelf-gehoste uitlegvideo's in `videos.ts`: die werken één som uit bij een
 * hoofdstuk, deze horen bij het kanaal — een lange video of een Short — en
 * kunnen op meerdere pagina's tegelijk staan.
 *
 * Eén video toevoegen is één regel in `VIDEOS`, met de pagina's (`paginas`)
 * waar hij moet verschijnen. Zet een video pas in deze lijst zodra YouTube
 * 200 teruggeeft op `https://www.youtube.com/oembed?url=https://youtu.be/<id>`
 * — staat hij nog gepland (niet openbaar), dan geeft dat adres een 403.
 */
export type VideoPagina =
  | 'quotientregel'
  | 'machtsregel'
  | 'raaklijn'
  | 'ln-x'
  | 'examentraining'
  | 'uitleg-videos'

/** Geen eigen theoriepagina voor logaritmes: alleen de kaart op `/theorie#kaart-h9-logaritmes`. */
const LN_X_OEFENEN = '/oefenen?chapter=h9&topic=h9_logaritmes'

export type WiskundeMetAafVideo = {
  /** Eigen, stabiele id. Niet het YouTube-id: dat kan nog wijzigen vóór publicatie. */
  id: string
  title: string
  /** Eén zin die bij de video op de kaart staat. */
  description: string
  /** Shorts komen alleen op hun eigen pagina's te staan, nooit op `uitleg-videos`. */
  soort: 'lang' | 'short'
  /** Weergaveduur, bv. "6:56". */
  duration: string
  youtubeId: string
  /** Bron bij een echte examenvraag: "CE vwo wiskunde B 2024 · tijdvak 1 · vraag 1". Null = geen examenvraag. */
  bron: string | null
  /** Pagina's waar de video moet verschijnen. */
  paginas: VideoPagina[]
  /** Oefenlink van het onderwerp dat de video uitlegt. */
  oefenen: string
}

const VIDEOS: WiskundeMetAafVideo[] = [
  {
    id: 'examen-2024-i-vraag-1-stijgt-de-grafiek',
    title: 'Examenvraag vwo wiskunde B: stijgt de grafiek in A?',
    description:
      'Aaf laat in een paar stappen zien hoe je met de machtsregel bepaalt of de grafiek in punt A stijgt of daalt.',
    soort: 'short',
    duration: '0:52',
    youtubeId: 'LOio2lv5V8M',
    bron: 'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 1',
    paginas: ['examentraining', 'machtsregel'],
    oefenen: MACHTSREGEL_OEFENEN,
  },

  {
    id: 'examen-2023-ii-vraag-1-raaklijn-in-o',
    title: 'Examenvraag vwo wiskunde B: de raaklijn in O',
    description:
      'Aaf leidt met de quotiëntregel de afgeleide af en bepaalt daarmee de vergelijking van de raaklijn in punt O.',
    soort: 'lang',
    duration: '2:55',
    youtubeId: 'dE6p5y89aFQ',
    bron: 'CE vwo wiskunde B 2023 · tijdvak 2 · vraag 1',
    paginas: ['quotientregel', 'examentraining', 'uitleg-videos'],
    oefenen: QUOTIENTREGEL_OEFENEN,
  },

  // AFG-768: de bijbehorende Short (BtdNsJpE2Js) komt er niet apart bij
  // zolang deze lange video over hetzelfde onderwerp op dezelfde pagina's
  // staat (zie de regel hierboven in dit bestand).

  {
    id: 'examentraining-zo-oefen-je-differentieren',
    title: 'Examen wiskunde B? Zo oefen je differentiëren',
    description: 'Aaf laat in een paar seconden zien hoe je gericht gaat oefenen met differentiëren voor het examen.',
    soort: 'short',
    duration: '0:43',
    youtubeId: 'Iey-oVqC3Qk',
    bron: null,
    paginas: ['examentraining'],
    oefenen: DIFFERENTIEERREGELS_OEFENEN,
  },

  {
    id: 'afgeleide-en-primitieve-van-ln-x',
    title: 'Afgeleide en primitieve van ln x | alles in 3 minuten',
    description:
      'Aaf laat in drie minuten zien hoe je zowel de afgeleide als de primitieve van ln(x) bepaalt.',
    soort: 'lang',
    duration: '3:23',
    youtubeId: 'q53YUlb5QzQ',
    bron: null,
    paginas: ['ln-x', 'uitleg-videos'],
    oefenen: LN_X_OEFENEN,
  },

  // AFG-821: de bijbehorende Short (gnw1Ipv9baQ) komt er niet apart bij
  // zolang deze lange video over hetzelfde onderwerp op dezelfde pagina's
  // staat (zelfde regel als bij BtdNsJpE2Js hierboven).

  {
    id: 'examen-2024-i-vraag-6-verschoven-grafiek',
    title: 'Examenvraag vwo wiskunde B: functievoorschrift van de verschoven grafiek',
    description:
      'Aaf gebruikt de helling van de raaklijn in punt A om het functievoorschrift van de verschoven grafiek g op te stellen.',
    soort: 'lang',
    duration: '5:17',
    youtubeId: 'sc3bY-eQKw8',
    bron: 'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 6',
    paginas: ['examentraining', 'raaklijn', 'uitleg-videos'],
    oefenen: RAAKLIJN_OEFENEN,
  },

  // AFG-822: de bijbehorende Short (ICCQ50-yDqk) komt er niet apart bij
  // zolang deze lange video over hetzelfde onderwerp op dezelfde pagina's
  // staat (zelfde regel als bij BtdNsJpE2Js hierboven).
]

/** Video's die op deze pagina moeten verschijnen, in de volgorde van `VIDEOS`. */
export function getWiskundeMetAafVideos(pagina: VideoPagina): WiskundeMetAafVideo[] {
  return VIDEOS.filter((video) => video.paginas.includes(pagina))
}

/**
 * Oefenlink onder een video, met de herkomstcode `youtube` erbij (zelfde
 * code als de startpagina, AFG-792) — niet `youtube-video`, want die staat
 * niet in `TOEGESTANE_HERKOMST` en wordt dus genegeerd (AFG-868).
 */
export function oefenlinkMetYoutubeHerkomst(oefenen: string): string {
  return `${oefenen}&van=youtube`
}
