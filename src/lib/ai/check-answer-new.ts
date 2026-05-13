import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'
import { normalizeAnswer } from '@/lib/practice/engine'

import { generateJson } from './gemini'
import { buildCheckAnswerPromptNew } from './prompts'

type DB = SupabaseClient<Database>

export type CheckAnswerResultNew = {
  errorExplanation: string
  category: string | null
  fromCache: boolean
  isMathematicallyCorrect: boolean
  generatedSteps: Array<{ step_order: number; step_description: string }>
}

export type CheckAnswerErrorNew = { error: string }

type AiAnswerJson = {
  is_mathematically_correct?: boolean
  category?: string
  error_explanation?: string
  solution_steps?: string[]
}

/**
 * Analyseer een fout antwoord op een questions_new vraag.
 * - Cache: eerst known_wrong_answers_new, dan Gemini.
 * - Schrijfacties op questions_new en known_wrong_answers_new vereisen
 *   een service role client (RLS schrijfbeleid = admin only).
 */
export async function checkWrongAnswerNew(
  db: DB,
  questionId: string,
  studentAnswer: string,
): Promise<CheckAnswerResultNew | CheckAnswerErrorNew> {
  const normalized = normalizeAnswer(studentAnswer)

  // 1. Cache: check known alternatives (mathematically equivalent notations)
  const { data: question0 } = await db
    .from('questions_new')
    .select('answer_alternatives')
    .eq('id', questionId)
    .maybeSingle()

  if (question0) {
    const alts: string[] = question0.answer_alternatives ?? []
    if (alts.some((alt) => normalizeAnswer(alt) === normalized)) {
      return {
        errorExplanation: '',
        category: null,
        fromCache: true,
        isMathematicallyCorrect: true,
        generatedSteps: [],
      }
    }
  }

  // 2. Cache: known wrong answers
  const { data: cached } = await db
    .from('known_wrong_answers_new')
    .select('id, wrong_answer, error_explanation, category, seen_count')
    .eq('question_id', questionId)

  for (const row of cached ?? []) {
    if (normalizeAnswer(row.wrong_answer) === normalized) {
      await db
        .from('known_wrong_answers_new')
        .update({ seen_count: row.seen_count + 1 })
        .eq('id', row.id)
      return {
        errorExplanation: row.error_explanation,
        category: row.category ?? null,
        fromCache: true,
        isMathematicallyCorrect: false,
        generatedSteps: [],
      }
    }
  }

  // 3. Context voor de prompt
  const { data: question } = await db
    .from('questions_new')
    .select('id, latex_body, answer, topic_id, cluster_id')
    .eq('id', questionId)
    .maybeSingle()

  if (!question) return { error: 'Vraag niet gevonden.' }

  const [{ data: topic }, { data: cluster }] = await Promise.all([
    db.from('topics_new').select('title').eq('id', question.topic_id).maybeSingle(),
    db.from('topic_clusters_new').select('title').eq('id', question.cluster_id).maybeSingle(),
  ])

  // 4. Controleer of stappenplan al bestaat
  const stepsCheck = await db
    .from('question_steps_new')
    .select('id')
    .eq('question_id', question.id)
    .limit(1)
  const stepsAlreadyExist = (stepsCheck.data?.length ?? 0) > 0

  // 5. Prompt → Gemini
  const prompt = buildCheckAnswerPromptNew({
    questionBody: question.latex_body ?? '',
    correctAnswer: question.answer,
    studentAnswer,
    topicTitle: topic?.title ?? '',
    clusterTitle: cluster?.title ?? '',
    stepsAlreadyExist,
  })

  const ai = await generateJson<AiAnswerJson>(prompt)
  if (!ai.ok) return { error: ai.error }

  const isMathematicallyCorrect = ai.data.is_mathematically_correct === true
  const explanation = isMathematicallyCorrect
    ? ''
    : (ai.data.error_explanation ?? '').toString().trim() ||
      'Je antwoord is niet correct. Kijk je tussenstappen eens goed na.'

  // 6. Wiskundig correct: alternatieve notatie opslaan
  if (isMathematicallyCorrect) {
    const { data: qRow } = await db
      .from('questions_new')
      .select('answer_alternatives')
      .eq('id', questionId)
      .maybeSingle()
    const current: string[] = qRow?.answer_alternatives ?? []
    if (!current.some((a) => normalizeAnswer(a) === normalized)) {
      await db
        .from('questions_new')
        .update({ answer_alternatives: [...current, studentAnswer] })
        .eq('id', questionId)
    }
    return {
      errorExplanation: '',
      category: null,
      fromCache: false,
      isMathematicallyCorrect: true,
      generatedSteps: [],
    }
  }

  const category = (ai.data.category ?? '').toString().trim() || null

  // 7. Opslaan in known_wrong_answers_new (idempotent via UNIQUE)
  await db.from('known_wrong_answers_new').upsert(
    {
      question_id: questionId,
      wrong_answer: studentAnswer,
      error_explanation: explanation,
      category,
    },
    { onConflict: 'question_id,wrong_answer' },
  )

  // 8. Stappenplan genereren als er nog geen zijn
  let generatedSteps: Array<{ step_order: number; step_description: string }> = []
  if (!stepsAlreadyExist) {
    const rawSteps = (ai.data.solution_steps ?? []).filter(
      (s): s is string => typeof s === 'string' && s.trim().length > 0,
    )
    if (rawSteps.length > 0) {
      generatedSteps = rawSteps.map((step, i) => ({
        step_order: i + 1,
        step_description: step.trim(),
      }))
      await db.from('question_steps_new').insert(
        generatedSteps.map((s) => ({ question_id: questionId, ...s })),
      )
    }
  }

  return {
    errorExplanation: explanation,
    category,
    fromCache: false,
    isMathematicallyCorrect: false,
    generatedSteps,
  }
}
