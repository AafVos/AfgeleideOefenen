import {
  blokIdVanSoort,
  oefenIndeling,
  vergelijkHoofdstukVolgorde,
  type OefenIndeling,
} from '@/lib/practice/oefenen-indeling'

/**
 * De zelf-toets kiest per theorieblok. Een blok is de vragen van alle
 * onderwerpen die eraan hangen. Daarbinnen kan de leerling ook één soort
 * som kiezen. Hoofdstukken zonder blokken, zoals Beweging, blijven de
 * lijst van onderwerpen.
 */

export type ToetsCluster = {
  id: string
  slug: string
  title: string
  questionCount: number
  newCount: number
  wrongCount: number
}

export type ToetsOnderwerp = {
  id: string
  title: string
  clusters: ToetsCluster[]
}

export type ToetsBlok = {
  id: string
  slug: string
  letter: string
  title: string
  /** Wat de leerling hoort, bijvoorbeeld "2.4 A Raaklijn". */
  naam: string
  heeftOpgaven: boolean
  clusters: ToetsCluster[]
  onderwerpen: ToetsOnderwerp[]
}

export type ToetsParagraaf = {
  id: string
  label: string
  title: string
  blokken: ToetsBlok[]
}

export type ToetsHoofdstuk = {
  id: string
  slug: string
  title: string
  paragrafen: ToetsParagraaf[]
  /** Onderwerpen die niet aan een theorieblok hangen. */
  losseOnderwerpen: ToetsOnderwerp[]
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
  title: string
  chapter_id: string
  order_index: number
  theory_block_id: string | null
}

type ClusterInvoer = ToetsCluster & {
  topic_id: string
  order_index: number
  theory_block_id?: string | null
}

export type ZelfToetsIndelingInvoer = {
  chapters: HoofdstukInvoer[]
  paragraphs: ParagraafInvoer[]
  blocks: BlokInvoer[]
  topics: OnderwerpInvoer[]
  clusters: ClusterInvoer[]
}

function clustersVan(topicId: string, clusters: ClusterInvoer[]): ToetsCluster[] {
  return clusters
    .filter((cluster) => cluster.topic_id === topicId)
    .sort((a, b) => a.order_index - b.order_index)
    .map(({ id, slug, title, questionCount, newCount, wrongCount }) => ({
      id,
      slug,
      title,
      questionCount,
      newCount,
      wrongCount,
    }))
}

function onderwerpVan(topic: OnderwerpInvoer, clusters: ClusterInvoer[]): ToetsOnderwerp {
  return {
    id: topic.id,
    title: topic.title,
    clusters: clustersVan(topic.id, clusters),
  }
}

export function bouwZelfToetsBoom(data: ZelfToetsIndelingInvoer): ToetsHoofdstuk[] {
  const paragraphById = new Map(data.paragraphs.map((p) => [p.id, p]))
  const blockById = new Map(data.blocks.map((b) => [b.id, b]))

  const hoofdstukken: ToetsHoofdstuk[] = []

  for (const chapter of [...data.chapters].sort(vergelijkHoofdstukVolgorde)) {
    const topics = data.topics
      .filter((topic) => topic.chapter_id === chapter.id)
      .sort((a, b) => a.order_index - b.order_index)

    const paragraphs = data.paragraphs
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

    const paragrafen: ToetsParagraaf[] = paragraphs
      .map((paragraph) => ({
        id: paragraph.id,
        label: paragraph.label,
        title: paragraph.title,
        blokken: data.blocks
          .filter((block) => block.paragraph_id === paragraph.id)
          .sort((a, b) => a.order_index - b.order_index)
          .map((block) => {
            const vanBlok = data.clusters.filter((cluster) => {
              const topic = topics.find((item) => item.id === cluster.topic_id)
              if (!topic) return false
              return blokInHoofdstuk(blokIdVanSoort(cluster, topic)) === block.id
            })
            const onderwerpIds = topics
              .filter((topic) => vanBlok.some((cluster) => cluster.topic_id === topic.id))
              .map((topic) => topic.id)
            const onderwerpen = onderwerpIds.map((id) =>
              onderwerpVan(
                topics.find((topic) => topic.id === id)!,
                vanBlok,
              ),
            )
            const clusters = onderwerpen.flatMap((onderwerp) => onderwerp.clusters)
            return {
              id: block.id,
              slug: block.slug,
              letter: block.letter,
              title: block.title,
              naam: `${paragraph.label} ${block.letter} ${block.title}`,
              heeftOpgaven: clusters.length > 0,
              clusters,
              onderwerpen,
            }
          }),
      }))
      .filter((paragraph) => paragraph.blokken.length > 0)

    hoofdstukken.push({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      paragrafen,
      losseOnderwerpen: topics.flatMap((topic) => {
        if (blokInHoofdstuk(topic.theory_block_id)) return []
        const vanTopic = data.clusters.filter((cluster) => cluster.topic_id === topic.id)
        const zonderBlok = vanTopic.filter(
          (cluster) => !blokInHoofdstuk(blokIdVanSoort(cluster, topic)),
        )
        if (vanTopic.length > 0 && zonderBlok.length === 0) return []
        return [onderwerpVan(topic, zonderBlok)]
      }),
    })
  }

  return hoofdstukken
}

export function clusterIdsVanHoofdstuk(hoofdstuk: ToetsHoofdstuk): string[] {
  const uitBlokken = hoofdstuk.paragrafen.flatMap((paragraaf) =>
    paragraaf.blokken.flatMap((blok) => blok.clusters.map((cluster) => cluster.id)),
  )
  const uitLos = hoofdstuk.losseOnderwerpen.flatMap((onderwerp) =>
    onderwerp.clusters.map((cluster) => cluster.id),
  )
  return [...uitBlokken, ...uitLos]
}

export type ToetsResultaatGroep = {
  blockSlug: string
  chapterSlug: string
  topicSlug: string
  clusterSlug: string
}

/**
 * Link na afloop. Een som in een theorieblok gaat naar dat blok.
 * Zonder blok, of als de oude indeling aan staat, blijft de link met
 * hoofdstuk en onderwerp.
 */
export function linkNaToets(
  groep: ToetsResultaatGroep,
  indeling: OefenIndeling = oefenIndeling(),
): string {
  const sp = new URLSearchParams()
  if (groep.blockSlug && indeling === 'blok') {
    sp.set('blok', groep.blockSlug)
    if (groep.clusterSlug) sp.set('cluster', groep.clusterSlug)
  } else {
    if (groep.chapterSlug) sp.set('chapter', groep.chapterSlug)
    if (groep.topicSlug) sp.set('topic', groep.topicSlug)
    if (groep.clusterSlug) sp.set('cluster', groep.clusterSlug)
  }
  const query = sp.toString()
  return query ? `/oefenen?${query}` : '/oefenen'
}
