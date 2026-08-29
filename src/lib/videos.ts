import { SITE, type SiteId } from '@/config/site'

export type UitlegVideo = {
  slug: string
  title: string
  description: string
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

const STORAGE_BASE =
  'https://dccjsuyuolxwqqcjxtqe.supabase.co/storage/v1/object/public/videos'

const VIDEOS: Record<SiteId, UitlegVideo[]> = {
  afgeleiden: [
    {
      slug: 'somregel-of-productregel',
      title: 'Somregel of productregel?',
      description:
        'Wanneer gebruik je welke regel — en hoe de somregel binnen de productregel terugkomt.',
      duration: '2:21',
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
      title: 'Uitleg bij som 29',
      description:
        'm(q) = 1 − (3q² − 2)² differentiëren: eerst de somregel, en de productregel voor het kwadraat. Op verzoek!',
      duration: '1:50',
      src: `${STORAGE_BASE}/som-29.mp4`,
      clusterIds: [
        // De productregel · Kwadraat van een polynoom (het cluster van som 29)
        'd622e23a-4112-4eca-81fa-69187f8d48a1',
      ],
    },
  ],
  integralen: [],
}

export function getUitlegVideos(): UitlegVideo[] {
  return VIDEOS[SITE]
}
