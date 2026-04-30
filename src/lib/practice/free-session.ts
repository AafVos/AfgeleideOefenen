import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'

import { pickFreePracticeQuestion, type Question } from './engine'

type DB = SupabaseClient<Database>

export type QuestionStepRow = {
  id: string
  step_order: number
  step_description: string
}

/** Eerste cluster in het topic waar een vraag beschikbaar is (vrij oefenen: geen mastering-limiet). */
export async function loadFreePracticeForTopic(
  db: DB,
  topicId: string,
): Promise<{
  clusterId: string
  question: Question
  steps: QuestionStepRow[]
} | null> {
  const { data: clusters, error } = await db
    .from('topic_clusters')
    .select('id')
    .eq('topic_id', topicId)
    .order('order_index')
  if (error) throw new Error(error.message)

  for (const row of clusters ?? []) {
    const question = await pickFreePracticeQuestion(db, row.id)
    if (!question) continue

    const { data: steps } = await db
      .from('question_steps')
      .select('id, step_order, step_description')
      .eq('question_id', question.id)
      .order('step_order')

    return {
      clusterId: row.id,
      question,
      steps: steps ?? [],
    }
  }

  return null
}

/** Één gekozen opgave binnen een onderwerp — voor vrij oefenen via het tegeloverzicht. */
export async function loadFreePracticePackForQuestion(
  db: DB,
  questionId: string,
  topicId: string,
): Promise<{
  clusterId: string
  question: Question
  steps: QuestionStepRow[]
} | null> {
  const { data: q, error: qErr } = await db
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .eq('topic_id', topicId)
    .maybeSingle()

  if (qErr) throw new Error(qErr.message)
  if (!q) return null

  const { data: steps } = await db
    .from('question_steps')
    .select('id, step_order, step_description')
    .eq('question_id', q.id)
    .order('step_order')

  return {
    clusterId: q.cluster_id,
    question: q,
    steps: steps ?? [],
  }
}
