import { SITE, type SiteId } from '@/config/site'

/**
 * `algemeen` legt een onderwerp of regelkeuze uit; `vraaguitwerking` werkt één
 * opgave uit, meestal op verzoek van een leerling.
 */
export type VideoSoort = 'algemeen' | 'vraaguitwerking'

export type UitlegVideo = {
  slug: string
  title: string
  description: string
  soort: VideoSoort
  /** Hoofdstuk waar de video bij hoort, bv. "H2". Null = niet hoofdstukgebonden. */
  chapter: string | null
  /** Weergaveduur, bv. "2:21". */
  duration: string
  /** Publieke mp4-URL (Supabase Storage, bucket `videos` op prod). */
  src: string
  /**
   * Clusters (topic_clusters_new.id) waar de oefenvragen bij deze video
   * vandaan komen. Leeg = geen oefensectie tonen.
   */
  clusterIds: string[]
}

/**
 * Basis-URL van de publieke Storage-bucket `videos`. Volgt de omgeving: lokaal
 * en dev lezen uit hun eigen bucket, productie uit die van prod. Zet een nieuwe
 * mp4 dus in de bucket van élke omgeving waar je hem wilt zien.
 */
const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos`

const VIDEOS: Record<SiteId, UitlegVideo[]> = {
  afgeleiden: [
    {
      slug: 'somregel-of-productregel',
      title: 'Somregel of productregel?',
      description:
        'Wanneer gebruik je welke regel, en hoe de somregel binnen de productregel terugkomt.',
      soort: 'algemeen',
      chapter: 'H2',
      duration: '2:20',
      src: `${STORAGE_BASE}/somregel-of-productregel.mp4`,
      clusterIds: [
        // Termsgewijs differentiëren · Polynoom differentiëren (somregel)
        '606ef177-ecdb-4291-a8d0-ce667cc9d65c',
        // De productregel · Twee polynomen
        'faa995e4-1e45-4d93-8145-ee749232725d',
      ],
    },
    {
      slug: 'som-29',
      title: 'Uitleg bij #29 (H2)',
      description:
        'Hoofdstuk 2, som 29: m(q) = 1 − (3q² − 2)² differentiëren. Eerst de somregel, en de productregel voor het kwadraat. Op verzoek!',
      soort: 'vraaguitwerking',
      chapter: 'H2',
      duration: '2:14',
      src: `${STORAGE_BASE}/som-29.mp4`,
      clusterIds: [
        // De productregel · Kwadraat van een polynoom (het cluster van som 29)
        'd622e23a-4112-4eca-81fa-69187f8d48a1',
      ],
    },
    {
      slug: 'som-30',
      title: 'Uitleg bij #30 (H2)',
      description:
        'Hoofdstuk 2, som 30: k(x) = 5 − 3(x⁴ − x)(x + 1) differentiëren. Eerst de somregel, daarna de productregel voor het tweede deel. Op verzoek!',
      soort: 'vraaguitwerking',
      chapter: 'H2',
      duration: '2:35',
      src: `${STORAGE_BASE}/som-30.mp4`,
      clusterIds: [
        // Productregel: twee polynomen (het cluster van som 30)
        'faa995e4-1e45-4d93-8145-ee749232725d',
      ],
    },
    {
      slug: 'som-34',
      title: 'Uitleg bij #34 (H2)',
      description:
        'Hoofdstuk 2, som 34: f(x) = (x − 2)/(x + 5) differentiëren met de quotiëntregel. Op verzoek!',
      soort: 'vraaguitwerking',
      chapter: 'H2',
      duration: '1:20',
      src: `${STORAGE_BASE}/som-34.mp4`,
      clusterIds: [
        // De quotiëntregel · Eenvoudige breuk (het cluster van som 34)
        'a56f5e6f-4637-4087-98a4-6a60cec1deec',
      ],
    },
  ],
  integralen: [],
}

export function getUitlegVideos(): UitlegVideo[] {
  return VIDEOS[SITE]
}

/** De hoofdstukken waar video's bij horen, in de volgorde H2, H6, H7, H9. */
export function getVideoChapters(): string[] {
  const uniek = new Set(
    VIDEOS[SITE].map((v) => v.chapter).filter((c): c is string => c !== null),
  )
  return [...uniek].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
}

/**
 * De uitlegvideo die bij een cluster hoort, of null. Zo kan de oefenpagina bij
 * een vraag laten zien dat er uitleg over dat onderwerp klaarstaat.
 * Hoort een cluster bij meerdere video's, dan wint de laatst toegevoegde.
 */
export function getVideoForCluster(clusterId: string | null): UitlegVideo | null {
  if (!clusterId) return null
  const videos = VIDEOS[SITE]
  for (let i = videos.length - 1; i >= 0; i--) {
    if (videos[i].clusterIds.includes(clusterId)) return videos[i]
  }
  return null
}
