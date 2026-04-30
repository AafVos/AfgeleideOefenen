/**
 * Bulk writes to user_progress for onboarding (pad + diagnostische toets).
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'

import { MASTERY_THRESHOLD } from './engine'

type DB = SupabaseClient<Database>

export async function getClusterIdsForTopic(
  db: DB,
  topicId: string,
): Promise<string[]> {
  const { data, error } = await db
    .from('topic_clusters')
    .select('id')
    .eq('topic_id', topicId)
    .order('order_index')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => r.id)
}

export async function masterAllClustersInTopic(
  db: DB,
  userId: string,
  topicId: string,
): Promise<void> {
  const clusterIds = await getClusterIdsForTopic(db, topicId)
  const now = new Date().toISOString()
  for (const clusterId of clusterIds) {
    const { error } = await db.from('user_progress').upsert(
      {
        user_id: userId,
        topic_id: topicId,
        cluster_id: clusterId,
        status: 'mastered',
        correct_streak: MASTERY_THRESHOLD,
        total_answered: MASTERY_THRESHOLD,
        total_correct: MASTERY_THRESHOLD,
        mastered_at: now,
      },
      { onConflict: 'user_id,cluster_id' },
    )
    if (error) throw new Error(error.message)
  }
}

export async function clearProgressForTopic(
  db: DB,
  userId: string,
  topicId: string,
): Promise<void> {
  const clusterIds = await getClusterIdsForTopic(db, topicId)
  if (!clusterIds.length) return

  const { error } = await db
    .from('user_progress')
    .delete()
    .eq('user_id', userId)
    .in('cluster_id', clusterIds)
  if (error) throw new Error(error.message)
}

export type PadTopicSelection = {
  topicId: string
  kenIk: boolean
  wilOefenen: boolean
}

/** Past topic-keuzes toe zodat findActiveCluster overeenkomt met de intentie. */
export async function applyPadSelections(
  db: DB,
  userId: string,
  sortedTopicIds: string[],
  selections: Map<string, { kenIk: boolean; wilOefenen: boolean }>,
): Promise<void> {
  const fw = sortedTopicIds.findIndex((tid) => {
    const s = selections.get(tid)
    return s?.wilOefenen && !s.kenIk
  })
  if (fw === -1) {
    throw new Error(
      'Kies minimaal één onderwerp waar je nog aan wilt werken.',
    )
  }

  for (let idx = 0; idx < sortedTopicIds.length; idx++) {
    const topicId = sortedTopicIds[idx]!
    const s = selections.get(topicId) ?? {
      kenIk: false,
      wilOefenen: false,
    }

    if (s.kenIk) {
      await masterAllClustersInTopic(db, userId, topicId)
      continue
    }

    if (idx < fw) {
      await masterAllClustersInTopic(db, userId, topicId)
      continue
    }

    if (idx === fw) {
      await clearProgressForTopic(db, userId, topicId)
      continue
    }

    // Later in de lijn: niet "ken ik" → of overslaan (master = door het pad
    // springen) of bewust nog oefenen maar pas als het leerpad daar is.
    if (!s.wilOefenen) {
      await masterAllClustersInTopic(db, userId, topicId)
    }
    // wilOefenen && !kenIk: géén write — clusters blijven leeg/locked tot
    // eerdere topics in het pad af zijn.
  }
}

/** Één fout op de eerste foute onderwerp-regel breekt sequential mastery. */
export async function applyDiagnosticResults(
  db: DB,
  userId: string,
  orderedTopicIds: string[],
  correctByTopicOrder: boolean[],
): Promise<void> {
  let firstWrong = orderedTopicIds.length
  for (let i = 0; i < orderedTopicIds.length; i++) {
    if (!correctByTopicOrder[i]) {
      firstWrong = i
      break
    }
  }

  for (let i = 0; i < orderedTopicIds.length; i++) {
    const topicId = orderedTopicIds[i]!
    if (i < firstWrong) {
      await masterAllClustersInTopic(db, userId, topicId)
    } else {
      await clearProgressForTopic(db, userId, topicId)
    }
  }
}
