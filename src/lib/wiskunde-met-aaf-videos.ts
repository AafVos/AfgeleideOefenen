import { MACHTSREGEL_OEFENEN } from '@/content/theory/machtsregel'
import { QUOTIENTREGEL_OEFENEN } from '@/content/theory/quotientregel'

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
export type VideoPagina = 'quotientregel' | 'machtsregel' | 'examentraining' | 'uitleg-videos'

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
]

/** Video's die op deze pagina moeten verschijnen, in de volgorde van `VIDEOS`. */
export function getWiskundeMetAafVideos(pagina: VideoPagina): WiskundeMetAafVideo[] {
  return VIDEOS.filter((video) => video.paginas.includes(pagina))
}
