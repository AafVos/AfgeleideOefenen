import type { SupabaseClient } from '@supabase/supabase-js'

import { SITE } from '@/config/site'
import type { Database } from '@/lib/supabase/types'

type DB = SupabaseClient<Database>

export type ChapterInfo = {
  id: string
  slug: string
  title: string
  book_part: number
  order_index: number
}

export type TopicCategory =
  | 'primitiveren'
  | 'integralen'
  | 'vergelijkingen'
  | 'toepassingen'

export type TopicInfo = {
  id: string
  slug: string
  title: string
  chapter_id: string
  order_index: number
  category: TopicCategory | null
}

export type ClusterInfo = {
  id: string
  slug: string
  title: string
  topic_id: string
  order_index: number
}

export type NewExerciseTile = {
  questionId: string
  clusterId: string
  ordinal: number
  difficulty: 1 | 2 | 3
  latex_body: string | null
  preview: string
  lastCorrect: boolean | null
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
    .eq('site', SITE)
    .order('order_index')
  if (error) throw new Error(error.message)
  return (data ?? []) as ChapterInfo[]
}

export async function loadAllTopics(db: DB): Promise<TopicInfo[]> {
  const { data, error } = await db
    .from('topics_new')
    .select('id, slug, title, chapter_id, order_index, category')
    .eq('site', SITE)
    .order('order_index')
  if (error) throw new Error(error.message)
  return (data ?? []) as TopicInfo[]
}

export async function loadClustersForTopics(
  db: DB,
  topicIds: string[],
): Promise<ClusterInfo[]> {
  if (!topicIds.length) return []
  const { data, error } = await db
    .from('topic_clusters_new')
    .select('id, slug, title, topic_id, order_index')
    .eq('site', SITE)
    .in('topic_id', topicIds)
    .order('order_index')
  if (error) throw new Error(error.message)
  return (data ?? []) as ClusterInfo[]
}

export async function loadTilesForClusters(
  db: DB,
  clusterIds: string[],
): Promise<NewExerciseTile[]> {
  if (!clusterIds.length) return []
  const { data, error } = await db
    .from('questions_new')
    .select('id, cluster_id, difficulty, order_index, latex_body')
    .eq('site', SITE)
    .in('cluster_id', clusterIds)
  if (error) throw new Error(error.message)

  const sorted = (data ?? []).slice().sort((a, b) => {
    const ai = clusterIds.indexOf(a.cluster_id)
    const bi = clusterIds.indexOf(b.cluster_id)
    if (ai !== bi) return ai - bi
    if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty
    return (a.order_index ?? 999) - (b.order_index ?? 999)
  })

  // Laatste goed/fout-status per vraag (RLS beperkt tot eigen sessies)
  const lastCorrectByQuestionId = new Map<string, boolean>()
  if (sorted.length) {
    const { data: attempts, error: aErr } = await db
      .from('session_answers_new')
      .select('question_id, is_correct, answered_at')
      .in('question_id', sorted.map((q) => q.id))
      .order('answered_at', { ascending: false })
    if (aErr) throw new Error(aErr.message)
    for (const row of attempts ?? []) {
      if (row.is_correct !== true && row.is_correct !== false) continue
      if (!lastCorrectByQuestionId.has(row.question_id)) {
        lastCorrectByQuestionId.set(row.question_id, row.is_correct)
      }
    }
  }

  return sorted.map((q, i) => ({
    questionId: q.id,
    clusterId: q.cluster_id,
    ordinal: i + 1,
    difficulty: clampDiff(q.difficulty),
    latex_body: q.latex_body,
    preview: stripForPreview(q.latex_body ?? '', 56),
    lastCorrect: lastCorrectByQuestionId.get(q.id) ?? null,
  }))
}

export async function loadQuestionNew(
  db: DB,
  questionId: string,
): Promise<{
  id: string
  latex_body: string | null
  difficulty: 1 | 2 | 3
  steps: Array<{ id: string; step_order: number; step_description: string }>
} | null> {
  const { data: q, error: qErr } = await db
    .from('questions_new')
    .select('id, cluster_id, difficulty, latex_body')
    .eq('id', questionId)
    .maybeSingle()
  if (qErr) throw new Error(qErr.message)
  if (!q) return null

  const { data: steps } = await db
    .from('question_steps_new')
    .select('id, step_order, step_description')
    .eq('question_id', q.id)
    .order('step_order')

  return {
    id: q.id,
    latex_body: q.latex_body,
    difficulty: clampDiff(q.difficulty),
    steps: (steps ?? []) as Array<{
      id: string
      step_order: number
      step_description: string
    }>,
  }
}
