import { vergelijkHoofdstukVolgorde } from '@/lib/practice/oefenen-indeling'

/**
 * Voortgang op het dashboard.
 *
 * Bij de boekindeling staat de voortgang per paragraaf en theorieblok.
 * Het percentage is dezelfde gewogen som als per soort som, één laag hoger
 * opgeteld. Elke soort som telt precies één keer mee in het hoofdstuk.
 *
 * De oude indeling (per onderwerp) blijft beschikbaar via
 * `bouwOnderwerpVoortgang`. Het dashboard kiest met `oefenIndeling()`.
 */

export type ClusterVoortgang = {
  id: string
  totalAnswered: number
  totalCorrect: number
  isKnown: boolean
}

export type VoortgangRij = {
  cluster_id: string
  status: string | null
  total_answered: number | null
  total_correct: number | null
}

export type BlokRij = {
  id: string
  slug: string
  letter: string
  title: string
  heeftOpgaven: boolean
  clusters: ClusterVoortgang[]
}

export type ParagraafRij = {
  id: string
  label: string
  title: string
  blokken: BlokRij[]
}

export type OnderwerpRij = {
  id: string
  slug: string
  title: string
  chapterSlug: string
  clusters: ClusterVoortgang[]
}

export type NieuwHoofdstuk = {
  id: string
  slug: string
  title: string
  paragrafen: ParagraafRij[]
  /** Alle soorten sommen van dit hoofdstuk, ook van een los onderwerp. */
  clusters: ClusterVoortgang[]
  /** Onderwerpen die niet aan een theorieblok hangen. */
  losseOnderwerpen: OnderwerpRij[]
}

export type DashboardIndeling = {
  hoofdstukken: NieuwHoofdstuk[]
}

/** Soort som in de oude lijst. Heeft ook de slug, voor de startlink. */
export type OudCluster = ClusterVoortgang & {
  slug: string
  title: string
  topicId: string
}

/** De oude lijst: hoofdstuk, en daaronder de onderwerpen. */
export type OudHoofdstuk = {
  id: string
  slug: string
  title: string
  topics: Array<Omit<OnderwerpRij, 'clusters'> & { clusters: OudCluster[] }>
}

type HoofdstukInvoer = {
  id: string
  slug: string
  title: string
  order_index: number
}

type ParagraafInvoer = {
  id: string
  chapter_id: string
  slug: string
  label: string
  title: string
  order_index: number
}

type BlokInvoer = {
  id: string
  paragraph_id: string
  slug: string
  letter: string
  title: string
  order_index: number
}

type OnderwerpInvoer = {
  id: string
  slug: string
  title: string
  chapter_id: string
  order_index: number
  theory_block_id?: string | null
}

type ClusterInvoer = {
  id: string
  slug: string
  title: string
  topic_id: string
  order_index: number
}

export function weegClusters(clusters: ClusterVoortgang[]) {
  const mastered = clusters.filter((c) => c.isKnown).length
  const total = clusters.length
  const weighted = clusters.reduce((sum, c) => {
    if (c.isKnown) return sum + 1
    if (c.totalAnswered > 0) return sum + c.totalCorrect / c.totalAnswered
    return sum
  }, 0)
  const pct = total > 0 ? Math.round((weighted / total) * 100) : 0
  return { mastered, total, weighted, pct }
}

export function hrefVoorBlok(slug: string): string {
  return `/oefenen?blok=${encodeURIComponent(slug)}`
}

export function hrefVoorOnderwerp(chapterSlug: string, topicSlug: string): string {
  return `/oefenen?chapter=${encodeURIComponent(chapterSlug)}&topic=${encodeURIComponent(topicSlug)}`
}

function clusterVan(
  cluster: ClusterInvoer,
  voortgang: Map<string, VoortgangRij>,
): ClusterVoortgang {
  const rij = voortgang.get(cluster.id)
  return {
    id: cluster.id,
    totalAnswered: rij?.total_answered ?? 0,
    totalCorrect: rij?.total_correct ?? 0,
    isKnown: rij?.status === 'mastered',
  }
}

export function bouwDashboardIndeling(input: {
  chapters: HoofdstukInvoer[]
  paragraphs: ParagraafInvoer[]
  blocks: BlokInvoer[]
  topics: OnderwerpInvoer[]
  clusters: ClusterInvoer[]
  voortgang: VoortgangRij[]
}): DashboardIndeling {
  const voortgang = new Map(input.voortgang.map((rij) => [rij.cluster_id, rij]))
  const paragraphById = new Map(input.paragraphs.map((p) => [p.id, p]))
  const blockById = new Map(input.blocks.map((b) => [b.id, b]))

  const clustersPerTopic = new Map<string, ClusterInvoer[]>()
  for (const cluster of input.clusters) {
    const lijst = clustersPerTopic.get(cluster.topic_id) ?? []
    lijst.push(cluster)
    clustersPerTopic.set(cluster.topic_id, lijst)
  }

  function clustersVan(topicId: string): ClusterVoortgang[] {
    return (clustersPerTopic.get(topicId) ?? [])
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .map((cluster) => clusterVan(cluster, voortgang))
  }

  function onderwerpRij(topic: OnderwerpInvoer, chapterSlug: string): OnderwerpRij {
    return {
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      chapterSlug,
      clusters: clustersVan(topic.id),
    }
  }

  const hoofdstukken: NieuwHoofdstuk[] = []

  for (const chapter of [...input.chapters].sort(vergelijkHoofdstukVolgorde)) {
    const topics = input.topics
      .filter((topic) => topic.chapter_id === chapter.id)
      .sort((a, b) => a.order_index - b.order_index)
    if (topics.length === 0) continue

    const paragraphs = input.paragraphs
      .filter((p) => p.chapter_id === chapter.id)
      .sort((a, b) => a.order_index - b.order_index)

    const blokVan = (topic: OnderwerpInvoer): BlokInvoer | null => {
      if (!topic.theory_block_id) return null
      const block = blockById.get(topic.theory_block_id)
      if (!block) return null
      const paragraph = paragraphById.get(block.paragraph_id)
      if (!paragraph || paragraph.chapter_id !== chapter.id) return null
      return block
    }

    const paragrafen: ParagraafRij[] = paragraphs
      .map((paragraph) => ({
        id: paragraph.id,
        label: paragraph.label,
        title: paragraph.title,
        blokken: input.blocks
          .filter((block) => block.paragraph_id === paragraph.id)
          .sort((a, b) => a.order_index - b.order_index)
          .map((block) => {
            const vanBlok = topics.filter((topic) => blokVan(topic)?.id === block.id)
            const clusters = vanBlok.flatMap((topic) => clustersVan(topic.id))
            return {
              id: block.id,
              slug: block.slug,
              letter: block.letter,
              title: block.title,
              heeftOpgaven: clusters.length > 0,
              clusters,
            }
          }),
      }))
      .filter((paragraph) => paragraph.blokken.length > 0)

    hoofdstukken.push({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      paragrafen,
      clusters: topics.flatMap((topic) => clustersVan(topic.id)),
      losseOnderwerpen: topics
        .filter((topic) => !blokVan(topic))
        .map((topic) => onderwerpRij(topic, chapter.slug)),
    })
  }

  return { hoofdstukken }
}

/** Oude dashboardlijst: per hoofdstuk de onderwerpen, niet de paragrafen. */
export function bouwOnderwerpVoortgang(input: {
  chapters: HoofdstukInvoer[]
  topics: OnderwerpInvoer[]
  clusters: ClusterInvoer[]
  voortgang: VoortgangRij[]
}): OudHoofdstuk[] {
  const voortgang = new Map(input.voortgang.map((rij) => [rij.cluster_id, rij]))
  const clustersPerTopic = new Map<string, ClusterInvoer[]>()
  for (const cluster of input.clusters) {
    const lijst = clustersPerTopic.get(cluster.topic_id) ?? []
    lijst.push(cluster)
    clustersPerTopic.set(cluster.topic_id, lijst)
  }

  return [...input.chapters].sort(vergelijkHoofdstukVolgorde).flatMap((chapter) => {
    const topics = input.topics
      .filter((topic) => topic.chapter_id === chapter.id)
      .sort((a, b) => a.order_index - b.order_index)
    if (topics.length === 0) return []
    return [
      {
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title,
        topics: topics.map((topic) => ({
          id: topic.id,
          slug: topic.slug,
          title: topic.title,
          chapterSlug: chapter.slug,
          clusters: (clustersPerTopic.get(topic.id) ?? [])
            .slice()
            .sort((a, b) => a.order_index - b.order_index)
            .map((cluster) => ({
              ...clusterVan(cluster, voortgang),
              slug: cluster.slug,
              title: cluster.title,
              topicId: topic.id,
            })),
        })),
      },
    ]
  })
}
