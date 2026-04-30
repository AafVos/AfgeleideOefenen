import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'

type DB = SupabaseClient<Database>

export type ExerciseTile = {
  questionId: string
  ordinal: number
  difficulty: 1 | 2 | 3
  body: string
  latex_body: string | null
  /** Platte tekst voor aria / screenreader */
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

/** Platte tekst voor aria / screenreader (KaTeX op de tegel zelf). */
export function previewFromQuestion(opts: {
  body: string
  latex_body: string | null
}): string {
  const base = opts.latex_body?.trim().length ? opts.latex_body : opts.body
  return stripForPreview(base, 56)
}

/**
 * Alle opgaven van een onderwerp + laatste goed/fout-status per vraag
 * op basis van de meest recente ingezonden poging voor deze gebruiker.
 */
export async function loadExerciseTilesForTopic(
  db: DB,
  topicId: string,
): Promise<{ tiles: ExerciseTile[] }> {
  const [{ data: clusters, error: cErr }, { data: questions, error: qErr }] =
    await Promise.all([
      db
        .from('topic_clusters')
        .select('id, order_index')
        .eq('topic_id', topicId)
        .order('order_index'),
      db
        .from('questions')
        .select('id, cluster_id, difficulty, order_index, body, latex_body')
        .eq('topic_id', topicId),
    ])

  if (cErr) throw new Error(cErr.message)
  if (qErr) throw new Error(qErr.message)

  const clusterMeta = new Map(
    (clusters ?? []).map((c) => [c.id, { order_index: c.order_index }]),
  )

  const enriched = (questions ?? []).map((q) => {
    const ci = clusterMeta.get(q.cluster_id)?.order_index ?? 999
    const o = q.order_index ?? 999999
    return { q, clusterOrder: ci, qOrder: o }
  })

  enriched.sort((a, b) => {
    const da = a.q.difficulty
    const ddb = b.q.difficulty
    if (da !== ddb) return da - ddb
    if (a.clusterOrder !== b.clusterOrder)
      return a.clusterOrder - b.clusterOrder
    if (a.qOrder !== b.qOrder) return a.qOrder - b.qOrder
    return a.q.id.localeCompare(b.q.id)
  })

  const questionIds = enriched.map(({ q }) => q.id)
  const lastCorrectByQuestionId = new Map<string, boolean>()

  if (questionIds.length > 0) {
    const { data: attempts, error: aErr } = await db
      .from('session_answers')
      .select('question_id, is_correct, answered_at, session_id')
      .in('question_id', questionIds)
      .order('answered_at', { ascending: false })

    if (aErr) throw new Error(aErr.message)

    for (const row of attempts ?? []) {
      if (row.is_correct !== true && row.is_correct !== false) continue
      const qid = row.question_id
      if (!lastCorrectByQuestionId.has(qid)) {
        lastCorrectByQuestionId.set(qid, row.is_correct === true)
      }
    }
  }

  const tiles: ExerciseTile[] = enriched.map(({ q }, i) => ({
    questionId: q.id,
    ordinal: i + 1,
    difficulty: clampDifficulty(q.difficulty),
    body: q.body,
    latex_body: q.latex_body,
    preview: previewFromQuestion(q),
    lastCorrect: lastCorrectByQuestionId.has(q.id)
      ? (lastCorrectByQuestionId.get(q.id) ?? null)
      : null,
  }))

  return { tiles }
}

function clampDifficulty(n: number): 1 | 2 | 3 {
  if (n <= 1) return 1
  if (n >= 3) return 3
  return 2 as 1 | 2 | 3
}
