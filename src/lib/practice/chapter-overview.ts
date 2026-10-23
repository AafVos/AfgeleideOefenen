import type { SupabaseClient } from '@supabase/supabase-js'

import { vraagIsToepassing } from '@/lib/practice/answer-prefix'
import { gooiAlsFout } from '@/lib/supabase/fouten'
import type { Database } from '@/lib/supabase/types'

type DB = SupabaseClient<Database>

export type ChapterInfo = {
  id: string
  slug: string
  title: string
  book_part: number
  order_index: number
}

export type TopicInfo = {
  id: string
  slug: string
  title: string
  chapter_id: string
  order_index: number
  theory_block_id: string | null
}

export type ParagraphInfo = {
  id: string
  chapter_id: string
  slug: string
  label: string
  title: string
  order_index: number
}

export type TheoryBlockInfo = {
  id: string
  paragraph_id: string
  slug: string
  letter: string
  title: string
  order_index: number
}

export type ClusterInfo = {
  id: string
  slug: string
  title: string
  topic_id: string
  order_index: number
  /** Eigen theorieblok. Ontbreekt het, dan geldt het blok van het onderwerp. */
  theory_block_id: string | null
}

export type NewExerciseTile = {
  questionId: string
  clusterId: string
  ordinal: number
  difficulty: 1 | 2 | 3
  latex_body: string | null
  preview: string
  lastCorrect: boolean | null
  /** Context of tekst vóór het antwoordvak: een verhaaltje of toepassing. */
  verhaal: boolean
  /** Bronregel van een echte examenvraag. Leeg bij een eigen opgave. */
  sourceLabel: string | null
  sourceUrl: string | null
}

function stripForPreview(raw: string, maxLen: number): string {
  const oneLine = raw
    .replace(/\$\$/g, ' ')
    .replace(/\$/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return oneLine.length <= maxLen
    ? oneLine
    : `${oneLine.slice(0, maxLen - 1).trim()}…`
}

function clampDiff(n: number): 1 | 2 | 3 {
  if (n <= 1) return 1
  if (n >= 3) return 3
  return 2 as 1 | 2 | 3
}

export async function loadChapters(db: DB): Promise<ChapterInfo[]> {
  const { data, error } = await db
    .from('chapters')
    .select('id, slug, title, book_part, order_index')
    .order('order_index')
  gooiAlsFout(error)
  return (data ?? []) as ChapterInfo[]
}

export async function loadAllTopics(db: DB): Promise<TopicInfo[]> {
  const { data, error } = await db
    .from('topics_new')
    .select('id, slug, title, chapter_id, order_index, theory_block_id')
    .order('order_index')
  gooiAlsFout(error)
  return (data ?? []) as TopicInfo[]
}

export async function loadParagraphs(db: DB): Promise<ParagraphInfo[]> {
  const { data, error } = await db
    .from('paragraphs')
    .select('id, chapter_id, slug, label, title, order_index')
    .eq('zichtbaar', true)
    .order('order_index')
  gooiAlsFout(error)
  return (data ?? []) as ParagraphInfo[]
}

/** Blokken van een verborgen paragraaf horen nergens in de indeling. */
export function blokkenVanParagrafen<T extends { paragraph_id: string }>(
  blocks: T[],
  paragraphs: { id: string }[],
): T[] {
  const ids = new Set(paragraphs.map((p) => p.id))
  return blocks.filter((block) => ids.has(block.paragraph_id))
}

export async function loadTheoryBlocks(db: DB): Promise<TheoryBlockInfo[]> {
  const { data, error } = await db
    .from('theory_blocks')
    .select('id, paragraph_id, slug, letter, title, order_index')
    .order('order_index')
  gooiAlsFout(error)
  return (data ?? []) as TheoryBlockInfo[]
}

export async function loadAllClusters(db: DB): Promise<ClusterInfo[]> {
  const { data, error } = await db
    .from('topic_clusters_new')
    .select('id, slug, title, topic_id, order_index, theory_block_id')
    .order('order_index')
  gooiAlsFout(error)
  return (data ?? []) as ClusterInfo[]
}

export type VoortgangRij = {
  cluster_id: string
  status: string | null
  correct_streak: number | null
}

/** Per soort som: beheerst of niet, en goed op rij. Zelfde rijen als het dashboard. */
export async function loadVoortgang(db: DB, userId: string): Promise<VoortgangRij[]> {
  const { data, error } = await db
    .from('user_progress_new')
    .select('cluster_id, status, correct_streak')
    .eq('user_id', userId)
  gooiAlsFout(error)
  return (data ?? []) as VoortgangRij[]
}

export type VraagVoorTegel = {
  id: string
  cluster_id: string
  difficulty: number
  order_index: number | null
  latex_body: string | null
  answer_prefix: string | null
  source_label: string | null
  source_url: string | null
}

/** Alle opgaven. De volgorde van de tegels bepaalt `naarTegels`, niet deze query. */
export async function loadAlleVragen(db: DB): Promise<VraagVoorTegel[]> {
  const { data, error } = await db
    .from('questions_new')
    .select('id, cluster_id, difficulty, order_index, latex_body, answer_prefix, source_label, source_url')
  gooiAlsFout(error)
  return (data ?? []) as VraagVoorTegel[]
}

/**
 * Nieuwste goed/fout per opgave, voor de kleur van de tegel.
 *
 * Eén aanroep. De database geeft per opgave alleen de laatste poging terug,
 * niet elke eerdere keer. Alleen de eigen rijen: de functie loopt als de
 * leerling zelf, en de tabel laat alleen zijn sessies zien.
 */
export async function loadLaatsteAntwoorden(
  db: DB,
): Promise<Map<string, boolean>> {
  const { data, error } = await db.rpc('laatste_antwoord_per_vraag')
  gooiAlsFout(error)
  const perVraag = new Map<string, boolean>()
  for (const row of data ?? []) {
    if (row.is_correct !== true && row.is_correct !== false) continue
    perVraag.set(row.question_id, row.is_correct)
  }
  return perVraag
}

/** De opgave die deze leerling het laatst beantwoordde, om daar weer te openen. */
export async function loadLaatsteVraagId(db: DB): Promise<string | null> {
  const { data, error } = await db
    .from('session_answers_new')
    .select('question_id')
    .order('answered_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  gooiAlsFout(error)
  return data?.question_id ?? null
}

/**
 * Soorten sommen in de volgorde van het boek: hoofdstuk, onderwerp, soort.
 * De lijsten komen al op `order_index` binnen; die volgorde blijft hier staan.
 */
export function clusterIdsOpVolgorde(
  chapters: Array<{ id: string }>,
  topics: Array<{ id: string; chapter_id: string }>,
  clusters: Array<{ id: string; topic_id: string }>,
): string[] {
  const onderwerpen = new Map<string, Array<{ id: string }>>()
  for (const topic of topics) {
    const lijst = onderwerpen.get(topic.chapter_id) ?? []
    lijst.push(topic)
    onderwerpen.set(topic.chapter_id, lijst)
  }
  const soorten = new Map<string, Array<{ id: string }>>()
  for (const cluster of clusters) {
    const lijst = soorten.get(cluster.topic_id) ?? []
    lijst.push(cluster)
    soorten.set(cluster.topic_id, lijst)
  }
  return chapters.flatMap((chapter) =>
    (onderwerpen.get(chapter.id) ?? []).flatMap((topic) =>
      (soorten.get(topic.id) ?? []).map((cluster) => cluster.id),
    ),
  )
}

/** Tegels in boekvolgorde, met de laatste goed/fout-kleur erbij. */
export function naarTegels(
  vragen: VraagVoorTegel[],
  clusterIds: string[],
  laatsteGoed: ReadonlyMap<string, boolean>,
): NewExerciseTile[] {
  const volgorde = new Map(clusterIds.map((id, index) => [id, index]))
  const sorted = vragen
    .filter((vraag) => volgorde.has(vraag.cluster_id))
    .slice()
    .sort((a, b) => {
      const ai = volgorde.get(a.cluster_id) ?? 0
      const bi = volgorde.get(b.cluster_id) ?? 0
      if (ai !== bi) return ai - bi
      if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty
      return (a.order_index ?? 999) - (b.order_index ?? 999)
    })

  return sorted.map((vraag, index) => ({
    questionId: vraag.id,
    clusterId: vraag.cluster_id,
    ordinal: index + 1,
    difficulty: clampDiff(vraag.difficulty),
    latex_body: vraag.latex_body,
    preview: stripForPreview(vraag.latex_body ?? '', 56),
    lastCorrect: laatsteGoed.get(vraag.id) ?? null,
    verhaal: vraagIsToepassing(vraag.latex_body, vraag.answer_prefix),
    sourceLabel: vraag.source_label,
    sourceUrl: vraag.source_url,
  }))
}

/** Opgaven van één soort som, in boekvolgorde. Voor de app: daar kiest de leerling een soort som, geen losse tegel. */
export async function loadVragenVoorCluster(db: DB, clusterId: string): Promise<VraagVoorTegel[]> {
  const { data, error } = await db
    .from('questions_new')
    .select('id, cluster_id, difficulty, order_index, latex_body, answer_prefix, source_label, source_url')
    .eq('cluster_id', clusterId)
    .order('difficulty')
    .order('order_index')
  gooiAlsFout(error)
  return (data ?? []) as VraagVoorTegel[]
}

export async function loadQuestionNew(
  db: DB,
  questionId: string,
): Promise<{
  id: string
  cluster_id: string | null
  latex_body: string | null
  answer_prefix: string | null
  difficulty: 1 | 2 | 3
  source_label: string | null
  source_url: string | null
  steps: Array<{ id: string; step_order: number; step_description: string }>
} | null> {
  const [vraag, stappen] = await Promise.all([
    db
      .from('questions_new')
      .select('id, cluster_id, difficulty, latex_body, answer_prefix, source_label, source_url')
      .eq('id', questionId)
      .maybeSingle(),
    db
      .from('question_steps_new')
      .select('id, step_order, step_description')
      .eq('question_id', questionId)
      .order('step_order'),
  ])
  gooiAlsFout(vraag.error)
  gooiAlsFout(stappen.error)
  const q = vraag.data
  if (!q) return null
  const steps = stappen.data

  return {
    id: q.id,
    cluster_id: q.cluster_id ?? null,
    latex_body: q.latex_body,
    answer_prefix: q.answer_prefix,
    difficulty: clampDiff(q.difficulty),
    source_label: q.source_label,
    source_url: q.source_url,
    steps: (steps ?? []) as Array<{
      id: string
      step_order: number
      step_description: string
    }>,
  }
}
