'use server'

import { revalidatePath } from 'next/cache'

import type { SupabaseClient } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export type ClusterMark = 'known' | 'skipped' | 'none'

async function mutateClusterMarkForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  clusterId: string,
  topicId: string,
  mark: ClusterMark,
): Promise<{ error?: string }> {
  const { data: existing } = await supabase
    .from('user_progress')
    .select('total_answered, status')
    .eq('user_id', userId)
    .eq('cluster_id', clusterId)
    .maybeSingle()

  if (mark === 'known') {
    const { error } = await supabase.from('user_progress').upsert(
      {
        user_id: userId,
        cluster_id: clusterId,
        topic_id: topicId,
        status: 'mastered',
        mastered_at: new Date().toISOString(),
        is_skipped: false,
      },
      { onConflict: 'user_id,cluster_id' },
    )
    if (error) return { error: error.message }
  } else if (mark === 'skipped') {
    const { error } = await supabase.from('user_progress').upsert(
      {
        user_id: userId,
        cluster_id: clusterId,
        topic_id: topicId,
        status: existing?.status ?? 'in_progress',
        is_skipped: true,
        mastered_at: null,
      },
      { onConflict: 'user_id,cluster_id' },
    )
    if (error) return { error: error.message }
  } else {
    if (existing && existing.total_answered > 0) {
      const { error } = await supabase
        .from('user_progress')
        .update({
          status: 'in_progress',
          is_skipped: false,
          mastered_at: null,
          correct_streak: 0,
        })
        .eq('user_id', userId)
        .eq('cluster_id', clusterId)
      if (error) return { error: error.message }
    } else if (existing) {
      await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', userId)
        .eq('cluster_id', clusterId)
    }
  }

  return {}
}

export async function setClusterMarkAction(
  clusterId: string,
  topicId: string,
  mark: ClusterMark,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const result = await mutateClusterMarkForUser(
    supabase,
    user.id,
    clusterId,
    topicId,
    mark,
  )
  if (!result.error) {
    revalidatePath('/nl/dashboard')
    revalidatePath('/en/dashboard')
  }
  return result
}

/** Apply one mark to every cluster within a topic (dashboard bulk). */
export async function setTopicMarksAction(
  topicId: string,
  clusterIds: string[],
  mark: ClusterMark,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  for (const clusterId of clusterIds) {
    const result = await mutateClusterMarkForUser(
      supabase,
      user.id,
      clusterId,
      topicId,
      mark,
    )
    if (result.error) return result
  }
  revalidatePath('/nl/dashboard')
  revalidatePath('/en/dashboard')
  return {}
}

export async function applySkippedSelectionAction(
  updates: Array<{ clusterId: string; topicId: string; skipped: boolean }>,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  for (const update of updates) {
    const { data: existing } = await supabase
      .from('user_progress')
      .select('status')
      .eq('user_id', user.id)
      .eq('cluster_id', update.clusterId)
      .maybeSingle()

    if (update.skipped) {
      const { error } = await supabase.from('user_progress').upsert(
        {
          user_id: user.id,
          cluster_id: update.clusterId,
          topic_id: update.topicId,
          status: existing?.status ?? 'in_progress',
          is_skipped: true,
        },
        { onConflict: 'user_id,cluster_id' },
      )
      if (error) return { error: error.message }
      continue
    }

    if (existing) {
      const { error } = await supabase
        .from('user_progress')
        .update({ is_skipped: false })
        .eq('user_id', user.id)
        .eq('cluster_id', update.clusterId)
      if (error) return { error: error.message }
    }
  }

  revalidatePath('/nl/dashboard')
  revalidatePath('/en/dashboard')
  return {}
}
