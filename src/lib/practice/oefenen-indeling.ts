import type {
  ChapterInfo,
  ClusterInfo,
  ParagraphInfo,
  TheoryBlockInfo,
  TopicInfo,
} from '@/lib/practice/chapter-overview'

/**
 * Leerlingen zien de indeling per theorieblok.
 * 'onderwerp' is de oude indeling (hoofdstuk, onderwerp, soort som). Die
 * blijft in de pagina, maar staat uit. De test roept die boom aan, zodat
 * hij blijft bestaan. Zie AGENTS.md om de schakelaar om te zetten.
 */
export type OefenIndeling = 'blok' | 'onderwerp'

export function oefenIndeling(): OefenIndeling {
  return 'blok'
}

export type Adres = {
  blok: string | null
  topic: string | null
  cluster: string | null
  chapter: string | null
}

export type Groep = {
  topicSlug: string | null
  clusterSlug: string | null
}

export type Selectie =
  | {
      soort: 'blok'
      blok: TheoryBlockInfo
      paragraph: ParagraphInfo
      chapter: ChapterInfo
      groep: Groep
    }
  | {
      soort: 'hoofdstuk'
      chapter: ChapterInfo
      groep: Groep
    }

export type BlokNode = {
  id: string
  slug: string
  letter: string
  title: string
  heeftOpgaven: boolean
}

export type ParagraafNode = {
  id: string
  slug: string
  label: string
  title: string
  blokken: BlokNode[]
}

export type HoofdstukNode = {
  chapter: ChapterInfo
  paragrafen: ParagraafNode[]
}

export type BlokBoom = {
  hoofdstukken: HoofdstukNode[]
  oudeOpgaven: ChapterInfo[]
}

export type OnderwerpNode = TopicInfo & { clusters: ClusterInfo[] }

export type OnderwerpHoofdstuk = {
  chapter: ChapterInfo
  onderwerpen: OnderwerpNode[]
}

export type Kopje = {
  id: string
  label: string
  sub: { id: string; label: string; clusterId: string }[]
}

type IndelingData = {
  chapters: ChapterInfo[]
  paragraphs: ParagraphInfo[]
  blocks: TheoryBlockInfo[]
  topics: TopicInfo[]
  clusters: ClusterInfo[]
  tiles: { clusterId: string }[]
}

const legeGroep: Groep = { topicSlug: null, clusterSlug: null }

/** Zelfde volgorde als het boek. Bij een gelijke volgorde beslist de slug. */
export function vergelijkHoofdstukVolgorde(
  a: { order_index: number; slug: string },
  b: { order_index: number; slug: string },
): number {
  if (a.order_index !== b.order_index) return a.order_index - b.order_index
  return a.slug.localeCompare(b.slug, 'nl')
}

export function blokIdsMetOpgaven(
  topics: TopicInfo[],
  clusters: ClusterInfo[],
  tiles: { clusterId: string }[],
): Set<string> {
  const topicById = new Map(topics.map((t) => [t.id, t]))
  const topicIdByCluster = new Map(clusters.map((c) => [c.id, c.topic_id]))
  const ids = new Set<string>()
  for (const tile of tiles) {
    const topicId = topicIdByCluster.get(tile.clusterId)
    const topic = topicId ? topicById.get(topicId) : undefined
    if (topic?.theory_block_id) ids.add(topic.theory_block_id)
  }
  return ids
}

export function bouwBlokBoom(data: IndelingData): BlokBoom {
  const metOpgaven = blokIdsMetOpgaven(data.topics, data.clusters, data.tiles)
  const paragraphsByChapter = new Map<string, ParagraphInfo[]>()
  for (const p of [...data.paragraphs].sort((a, b) => a.order_index - b.order_index)) {
    const arr = paragraphsByChapter.get(p.chapter_id) ?? []
    arr.push(p)
    paragraphsByChapter.set(p.chapter_id, arr)
  }
  const blocksByParagraph = new Map<string, TheoryBlockInfo[]>()
  for (const b of [...data.blocks].sort((a, b) => a.order_index - b.order_index)) {
    const arr = blocksByParagraph.get(b.paragraph_id) ?? []
    arr.push(b)
    blocksByParagraph.set(b.paragraph_id, arr)
  }

  const hoofdstukken: HoofdstukNode[] = []
  for (const chapter of [...data.chapters].sort(vergelijkHoofdstukVolgorde)) {
    const paragrafen = paragraphsByChapter.get(chapter.id) ?? []
    // Geen boekparagrafen (Beweging, Examentraining, het testhoofdstuk)
    // blijven op hun eigen plek, met hun onderwerpen als indeling.
    if (paragrafen.length === 0) {
      hoofdstukken.push({ chapter, paragrafen: [] })
      continue
    }
    hoofdstukken.push({
      chapter,
      paragrafen: paragrafen
        .map((p) => ({
          id: p.id,
          slug: p.slug,
          label: p.label,
          title: p.title,
          blokken: (blocksByParagraph.get(p.id) ?? []).map((b) => ({
            id: b.id,
            slug: b.slug,
            letter: b.letter,
            title: b.title,
            heeftOpgaven: metOpgaven.has(b.id),
          })),
        }))
        .filter((p) => p.blokken.length > 0),
    })
  }
  return { hoofdstukken, oudeOpgaven: [] }
}

/** De oude zijbalk: hoofdstuk, onderwerp, en daaronder de soorten sommen. */
export function bouwOnderwerpBoom(
  chapters: ChapterInfo[],
  topics: TopicInfo[],
  clusters: ClusterInfo[],
): OnderwerpHoofdstuk[] {
  const clustersByTopic = new Map<string, ClusterInfo[]>()
  for (const cl of clusters) {
    const arr = clustersByTopic.get(cl.topic_id) ?? []
    arr.push(cl)
    clustersByTopic.set(cl.topic_id, arr)
  }
  return chapters.map((chapter) => ({
    chapter,
    onderwerpen: topics
      .filter((t) => t.chapter_id === chapter.id)
      .map((t) => ({
        ...t,
        clusters: clustersByTopic.get(t.id) ?? [],
      })),
  }))
}

function padVanBlok(
  block: TheoryBlockInfo,
  data: IndelingData,
): { blok: TheoryBlockInfo; paragraph: ParagraphInfo; chapter: ChapterInfo } | null {
  const paragraph = data.paragraphs.find((p) => p.id === block.paragraph_id)
  if (!paragraph) return null
  const chapter = data.chapters.find((c) => c.id === paragraph.chapter_id)
  if (!chapter) return null
  return { blok: block, paragraph, chapter }
}

function eersteBlok(
  data: IndelingData,
  chapterId?: string,
): { blok: TheoryBlockInfo; paragraph: ParagraphInfo; chapter: ChapterInfo } | null {
  const boom = bouwBlokBoom(data)
  for (const h of boom.hoofdstukken) {
    if (chapterId && h.chapter.id !== chapterId) continue
    for (const p of h.paragrafen) {
      for (const node of p.blokken) {
        if (!node.heeftOpgaven) continue
        const block = data.blocks.find((b) => b.id === node.id)
        const paragraph = data.paragraphs.find((x) => x.id === p.id)
        if (block && paragraph) return { blok: block, paragraph, chapter: h.chapter }
      }
    }
  }
  return null
}

export function losSelectieOp(adres: Adres, data: IndelingData): Selectie | null {
  const topicBySlug = new Map(data.topics.map((t) => [t.slug, t]))
  const clusterBySlug = new Map(data.clusters.map((c) => [c.slug, c]))

  const vanTopic = (topic: TopicInfo, clusterSlug: string | null): Selectie | null => {
    const groep: Groep = { topicSlug: topic.slug, clusterSlug }
    if (topic.theory_block_id) {
      const block = data.blocks.find((b) => b.id === topic.theory_block_id)
      const pad = block ? padVanBlok(block, data) : null
      if (pad) return { soort: 'blok', ...pad, groep }
    }
    const chapter = data.chapters.find((c) => c.id === topic.chapter_id)
    if (!chapter) return null
    return { soort: 'hoofdstuk', chapter, groep }
  }

  if (adres.cluster) {
    const cluster = clusterBySlug.get(adres.cluster)
    const topic = cluster ? data.topics.find((t) => t.id === cluster.topic_id) : undefined
    if (topic) {
      const sel = vanTopic(topic, cluster!.slug)
      if (sel) return sel
    }
  }

  if (adres.topic) {
    const topic = topicBySlug.get(adres.topic)
    if (topic) {
      const sel = vanTopic(topic, null)
      if (sel) return sel
    }
  }

  if (adres.blok) {
    const block = data.blocks.find((b) => b.slug === adres.blok)
    const pad = block ? padVanBlok(block, data) : null
    if (pad) return { soort: 'blok', ...pad, groep: legeGroep }
  }

  if (adres.chapter) {
    const chapter = data.chapters.find((c) => c.slug === adres.chapter)
    if (chapter) {
      const pad = eersteBlok(data, chapter.id)
      if (pad) return { soort: 'blok', ...pad, groep: legeGroep }
      return { soort: 'hoofdstuk', chapter, groep: legeGroep }
    }
  }

  const pad = eersteBlok(data)
  if (pad) return { soort: 'blok', ...pad, groep: legeGroep }
  const boom = bouwBlokBoom(data)
  const zonderParagraaf = boom.hoofdstukken.find((h) => h.paragrafen.length === 0)
  if (zonderParagraaf) {
    return { soort: 'hoofdstuk', chapter: zonderParagraaf.chapter, groep: legeGroep }
  }
  return null
}

function onderwerpenVan(selectie: Selectie, topics: TopicInfo[]): TopicInfo[] {
  const van =
    selectie.soort === 'blok'
      ? topics.filter((t) => t.theory_block_id === selectie.blok.id)
      : topics.filter((t) => t.chapter_id === selectie.chapter.id)
  return [...van].sort((a, b) => a.order_index - b.order_index)
}

export function clusterIdsVoorSelectie(
  selectie: Selectie,
  topics: TopicInfo[],
  clusters: ClusterInfo[],
): string[] {
  const ids: string[] = []
  for (const topic of onderwerpenVan(selectie, topics)) {
    const vanTopic = clusters
      .filter((c) => c.topic_id === topic.id)
      .sort((a, b) => a.order_index - b.order_index)
    for (const cl of vanTopic) ids.push(cl.id)
  }
  return ids
}

/** Kopjes boven de tegels: het onderwerp, en daaronder de soort som. */
export function kopjesVoorSelectie(
  selectie: Selectie,
  topics: TopicInfo[],
  clusters: ClusterInfo[],
  tiles: { clusterId: string }[],
): Kopje[] {
  const metTegels = new Set(tiles.map((t) => t.clusterId))
  const kopjes: Kopje[] = []
  for (const topic of onderwerpenVan(selectie, topics)) {
    const groepen = clusters
      .filter((c) => c.topic_id === topic.id && metTegels.has(c.id))
      .sort((a, b) => a.order_index - b.order_index)
    if (groepen.length === 0) continue
    kopjes.push({
      id: `onderwerp-${topic.slug}`,
      label: topic.title,
      sub: groepen.map((c) => ({
        id: `groep-${c.slug}`,
        label: groepen.length > 1 ? c.title : '',
        clusterId: c.id,
      })),
    })
  }
  return kopjes
}

export function queryVoorSelectie(selectie: Selectie, questionId?: string): string {
  const sp = new URLSearchParams()
  if (selectie.soort === 'blok') sp.set('blok', selectie.blok.slug)
  else sp.set('chapter', selectie.chapter.slug)
  if (questionId) sp.set('q', questionId)
  return sp.toString()
}

export function naamVanSelectie(selectie: Selectie): string {
  if (selectie.soort === 'blok') {
    return `${selectie.paragraph.label} ${selectie.blok.letter} · ${selectie.blok.title}`
  }
  return `${selectie.chapter.slug.toUpperCase()} – ${selectie.chapter.title}`
}
