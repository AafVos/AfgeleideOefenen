import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'
import { normalizeAnswer } from '@/lib/practice/engine'

import { generateJson } from './gemini'
import { buildCheckAnswerPrompt } from './prompts'

type DB = SupabaseClient<Database>

export type CheckAnswerResult = {
  /** Leesbare uitleg voor de student (max 2 zinnen) */
  errorExplanation: string
  /** Slug van de root cause, als die herkend is */
  rootCauseSlug: string | null
  /** Kwam het antwoord uit onze cache? */
  fromCache: boolean
  /**
   * True als AI bepaalt dat het antwoord wiskundig correct is maar in een
   * andere notatie dan opgeslagen. De caller moet het antwoord dan als goed
   * rekenen en de alternatieve notatie opslaan.
   */
  isMathematicallyCorrect: boolean
  /** Nieuw gegenereerde stappen (leeg als al bestonden of niet gegenereerd) */
  generatedSteps: Array<{ step_order: number; step_description: string }>
}

export type CheckAnswerError = { error: string }

type AiAnswerJson = {
  is_mathematically_correct?: boolean
  root_cause?: string
  error_explanation?: string
  solution_steps?: string[]
}

/**
 * Analyseer een fout antwoord.
 * - Eerst checken we `known_wrong_answers` op een exacte (genormaliseerde) match.
 * - Als er geen cache-hit is roepen we Gemini aan en slaan het resultaat op.
 * - Gegenereerde vragen landen in `questions` met `is_ai_generated = true`.
 */
export async function checkWrongAnswer(
  db: DB,
  questionId: string,
  studentAnswer: string,
): Promise<CheckAnswerResult | CheckAnswerError> {
  const normalized = normalizeAnswer(studentAnswer)

  // 1. Cache check — first check known correct alternatives
  const { data: question0 } = await db
    .from('questions')
    .select('answer_alternatives')
    .eq('id', questionId)
    .maybeSingle()

  if (question0) {
    const alts: string[] = question0.answer_alternatives ?? []
    if (alts.some((alt) => normalizeAnswer(alt) === normalized)) {
      return {
        errorExplanation: 'Goed gedaan! Jouw antwoord is wiskundig correct.',
        rootCauseSlug: null,
        fromCache: true,
        isMathematicallyCorrect: true,
        generatedSteps: [],
      }
    }
  }

  // 2. Cache check — known wrong answers
  const { data: cached } = await db
    .from('known_wrong_answers')
    .select('id, wrong_answer, error_explanation, root_cause_slug, seen_count')
    .eq('question_id', questionId)

  for (const row of cached ?? []) {
    if (normalizeAnswer(row.wrong_answer) === normalized) {
      await db
        .from('known_wrong_answers')
        .update({ seen_count: row.seen_count + 1 })
        .eq('id', row.id)
      return {
        errorExplanation: row.error_explanation,
        rootCauseSlug: row.root_cause_slug,
        fromCache: true,
        isMathematicallyCorrect: false,
        generatedSteps: [],
      }
    }
  }

  // 3. Context ophalen voor de prompt
  const { data: question } = await db
    .from('questions')
    .select('id, latex_body, answer, topic_id, cluster_id, difficulty')
    .eq('id', questionId)
    .maybeSingle()

  if (!question) return { error: 'Vraag niet gevonden.' }

  const [{ data: topic }, { data: cluster }, { data: rootCauses }] =
    await Promise.all([
      db.from('topics').select('title').eq('id', question.topic_id).maybeSingle(),
      db
        .from('topic_clusters')
        .select('title')
        .eq('id', question.cluster_id)
        .maybeSingle(),
      db
        .from('root_causes')
        .select('slug, description')
        .eq('topic_id', question.topic_id),
    ])

  // 4. Check of stappenplan al bestaat
  const stepsCheck = await db.from('question_steps').select('id').eq('question_id', question.id).limit(1)
  const stepsAlreadyExist = (stepsCheck.data?.length ?? 0) > 0

  // 5. Prompt → Gemini
  const prompt = buildCheckAnswerPrompt({
    questionBody: question.latex_body ?? '',
    correctAnswer: question.answer,
    studentAnswer,
    topicTitle: topic?.title ?? '',
    clusterTitle: cluster?.title ?? '',
    rootCauses: (rootCauses ?? []).map((r) => ({
      slug: r.slug,
      description: r.description,
    })),
    stepsAlreadyExist,
  })

  const ai = await generateJson<AiAnswerJson>(prompt)
  if (!ai.ok) {
    return {
      error: ai.error,
    }
  }

  const isMathematicallyCorrect = ai.data.is_mathematically_correct === true

  // Als wiskundig correct: lege uitleg (geen "wat ging er mis" tonen)
  // Als echt fout: gebruik AI-uitleg of fallback
  const explanation = isMathematicallyCorrect
    ? ''
    : (ai.data.error_explanation ?? '').toString().trim() ||
      'Je antwoord is niet correct. Kijk je tussenstappen eens goed na.'

  // 6. Als wiskundig correct: sla de alternatieve notatie op in questions.answer_alternatives
  if (isMathematicallyCorrect) {
    const { data: qRow } = await db
      .from('questions')
      .select('answer_alternatives')
      .eq('id', questionId)
      .maybeSingle()

    const current: string[] = qRow?.answer_alternatives ?? []
    if (!current.some((a) => normalizeAnswer(a) === normalized)) {
      await db
        .from('questions')
        .update({ answer_alternatives: [...current, studentAnswer] })
        .eq('id', questionId)
    }

    return {
      errorExplanation: explanation,
      rootCauseSlug: null,
      fromCache: false,
      isMathematicallyCorrect: true,
      generatedSteps: [],
    }
  }

  const rootCauseSlug =
    (ai.data.root_cause ?? '').toString().trim() || null

  // 7. Opslaan in known_wrong_answers (idempotent via UNIQUE)
  await db.from('known_wrong_answers').upsert(
    {
      question_id: questionId,
      wrong_answer: studentAnswer,
      error_explanation: explanation,
      root_cause_slug: rootCauseSlug ?? 'onbekend',
    },
    { onConflict: 'question_id,wrong_answer' },
  )

  // 8. Stappenplan opslaan (alleen als er nog geen stappen zijn — al gecheckt vóór de prompt)
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
      await db.from('question_steps').insert(
        generatedSteps.map((s) => ({ question_id: questionId, ...s })),
      )
    }
  }

  return {
    errorExplanation: explanation,
    rootCauseSlug,
    fromCache: false,
    isMathematicallyCorrect: false,
    generatedSteps,
  }
}

