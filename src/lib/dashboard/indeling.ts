import { blokIdVanSoort, vergelijkHoofdstukVolgorde } from '@/lib/practice/oefenen-indeling'

/**
 * Voortgang op het dashboard.
 *
 * Bij de boekindeling staat de voortgang per paragraaf en theorieblok.
 * Het percentage is overal hetzelfde: het deel van de soorten sommen dat
 * beheerst is (`telBeheerst`). Elke soort som telt precies één keer mee in
 * het hoofdstuk.
 *
 * De oude indeling (per onderwerp) blijft beschikbaar via
 * `bouwOnderwerpVoortgang`. Het dashboard kiest met `oefenIndeling()`.
 */

export type ClusterVoortgang = {
  id: string
  title: string
  isKnown: boolean
  correctStreak: number
}

export type VoortgangRij = {
  cluster_id: string
  status: string | null
  correct_streak?: number | null
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
  theory_block_id?: string | null
}

/**
 * Hoeveel soorten sommen zijn er beheerst, en welk deel is dat?
 *
 * Eén som voor het hele dashboard: de ring bovenaan, elke balk en elke
 * "x/y"-telling rekenen hiermee. Het percentage is precies `x` gedeeld door
 * `y`, zodat een leerling nooit een bijna volle balk naast "0/10 beheerst"
 * ziet staan (AFG-421). Eerder telde een soort som die nog niet beheerst was
 * gedeeltelijk mee met het aandeel goede antwoorden; dat gaf twee getallen
 * naast elkaar die elkaar tegenspraken.
 */
export function telBeheerst(clusters: ReadonlyArray<Pick<ClusterVoortgang, 'isKnown'>>) {
  const mastered = clusters.filter((c) => c.isKnown).length
  const total = clusters.length
  // Afronden mag 0% of 100% niet uit het niets maken: het dashboard kleurt
  // 100% groen, en dat hoort alleen als echt alles beheerst is.
  const pct =
    mastered === 0
      ? 0
      : mastered === total
        ? 100
        : Math.min(99, Math.max(1, Math.round((mastered / total) * 100)))
  return { mastered, total, pct }
}

/**
 * Alle soorten sommen in de volgorde van het boek: hoofdstuk, paragraaf,
 * theorieblok, soort som. Daarna de onderwerpen die niet aan een theorieblok
 * hangen. Dit is precies de volgorde waarin ze op het dashboard en op de
 * oefenpagina onder elkaar staan, zodat "Ga verder met" dezelfde eerstvolgende
 * soort som aanwijst als de leerling zelf zou vinden (AFG-484).
 */
export function clusterVolgorde(indeling: DashboardIndeling): string[] {
  const volgorde: string[] = []
  const gezien = new Set<string>()
  const zet = (clusters: ReadonlyArray<Pick<ClusterVoortgang, 'id'>>) => {
    for (const cluster of clusters) {
      if (gezien.has(cluster.id)) continue
      gezien.add(cluster.id)
      volgorde.push(cluster.id)
    }
  }

  for (const hoofdstuk of indeling.hoofdstukken) {
    for (const paragraaf of hoofdstuk.paragrafen) {
      for (const blok of paragraaf.blokken) zet(blok.clusters)
    }
    for (const onderwerp of hoofdstuk.losseOnderwerpen) zet(onderwerp.clusters)
  }
  return volgorde
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
    title: cluster.title,
    isKnown: rij?.status === 'mastered',
    correctStreak: rij?.correct_streak ?? 0,
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

  const hoofdstukken: NieuwHoofdstuk[] = []

  for (const chapter of [...input.chapters].sort(vergelijkHoofdstukVolgorde)) {
    const topics = input.topics
      .filter((topic) => topic.chapter_id === chapter.id)
      .sort((a, b) => a.order_index - b.order_index)
    if (topics.length === 0) continue

    const paragraphs = input.paragraphs
      .filter((p) => p.chapter_id === chapter.id)
      .sort((a, b) => a.order_index - b.order_index)

    const blokInHoofdstuk = (blockId: string | null | undefined): string | null => {
      if (!blockId) return null
      const block = blockById.get(blockId)
      if (!block) return null
      const paragraph = paragraphById.get(block.paragraph_id)
      if (!paragraph || paragraph.chapter_id !== chapter.id) return null
      return block.id
    }

    const blokVanSoort = (cluster: ClusterInvoer, topic: OnderwerpInvoer): string | null =>
      blokInHoofdstuk(blokIdVanSoort(cluster, topic))

    const voortgangVan = (lijst: ClusterInvoer[]): ClusterVoortgang[] =>
      lijst.map((cluster) => clusterVan(cluster, voortgang))

    const paragrafen: ParagraafRij[] = paragraphs
      .map((paragraph) => ({
        id: paragraph.id,
        label: paragraph.label,
        title: paragraph.title,
        blokken: input.blocks
          .filter((block) => block.paragraph_id === paragraph.id)
          .sort((a, b) => a.order_index - b.order_index)
          .map((block) => {
            const clusters = topics.flatMap((topic) =>
              (clustersPerTopic.get(topic.id) ?? [])
                .filter((cluster) => blokVanSoort(cluster, topic) === block.id)
                .sort((a, b) => a.order_index - b.order_index),
            )
            return {
              id: block.id,
              slug: block.slug,
              letter: block.letter,
              title: block.title,
              heeftOpgaven: clusters.length > 0,
              clusters: voortgangVan(clusters),
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
      losseOnderwerpen: topics.flatMap((topic) => {
        if (blokInHoofdstuk(topic.theory_block_id)) return []
        const vanTopic = clustersPerTopic.get(topic.id) ?? []
        const zonderBlok = vanTopic.filter((cluster) => !blokVanSoort(cluster, topic))
        if (vanTopic.length > 0 && zonderBlok.length === 0) return []
        return [
          {
            id: topic.id,
            slug: topic.slug,
            title: topic.title,
            chapterSlug: chapter.slug,
            clusters: voortgangVan(
              [...zonderBlok].sort((a, b) => a.order_index - b.order_index),
            ),
          },
        ]
      }),
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
