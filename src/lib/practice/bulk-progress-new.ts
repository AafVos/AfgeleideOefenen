/**
 * Bulk writes to user_progress_new for onboarding (pad + diagnostische toets).
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'

import { MASTERY_THRESHOLD } from './engine'

type DB = SupabaseClient<Database>

async function getClusterIdsForTopicNew(
  db: DB,
  topicId: string,
): Promise<string[]> {
  const { data, error } = await db
    .from('topic_clusters_new')
    .select('id')
    .eq('topic_id', topicId)
    .order('order_index')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => r.id)
}

async function masterAllClustersInTopicNew(
  db: DB,
  userId: string,
  topicId: string,
): Promise<void> {
  const clusterIds = await getClusterIdsForTopicNew(db, topicId)
  const now = new Date().toISOString()
  for (const clusterId of clusterIds) {
    const { error } = await db.from('user_progress_new').upsert(
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

async function clearProgressForTopicNew(
  db: DB,
  userId: string,
  topicId: string,
): Promise<void> {
  const clusterIds = await getClusterIdsForTopicNew(db, topicId)
  if (!clusterIds.length) return

  const { error } = await db
    .from('user_progress_new')
    .delete()
    .eq('user_id', userId)
    .in('cluster_id', clusterIds)
  if (error) throw new Error(error.message)
}

export async function applyPadSelectionsNew(
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
    throw new Error('Kies minimaal één onderwerp waar je nog aan wilt werken.')
  }

  for (let idx = 0; idx < sortedTopicIds.length; idx++) {
    const topicId = sortedTopicIds[idx]!
    const s = selections.get(topicId) ?? { kenIk: false, wilOefenen: false }

    if (s.kenIk) {
      await masterAllClustersInTopicNew(db, userId, topicId)
      continue
    }

    if (idx < fw) {
      await masterAllClustersInTopicNew(db, userId, topicId)
      continue
    }

    if (idx === fw) {
      await clearProgressForTopicNew(db, userId, topicId)
      continue
    }

    if (!s.wilOefenen) {
      await masterAllClustersInTopicNew(db, userId, topicId)
    }
  }
}

export async function applyDiagnosticResultsNew(
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
      await masterAllClustersInTopicNew(db, userId, topicId)
    } else {
      await clearProgressForTopicNew(db, userId, topicId)
    }
  }
}
