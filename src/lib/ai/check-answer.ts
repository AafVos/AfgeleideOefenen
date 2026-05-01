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
  /** Aantal nieuwe vragen dat Gemini heeft toegevoegd */
  newQuestions: number
  /**
   * True als AI bepaalt dat het antwoord wiskundig correct is maar in een
   * andere notatie dan opgeslagen. De caller moet het antwoord dan als goed
   * rekenen en de alternatieve notatie opslaan.
   */
  isMathematicallyCorrect: boolean
}

export type CheckAnswerError = { error: string }

type AiAnswerJson = {
  is_mathematically_correct?: boolean
  root_cause?: string
  error_explanation?: string
  solution_steps?: string[]
  needs_new_questions?: boolean
  generated_questions?: Array<{
    body?: string
    latex_body?: string
    answer?: string
    latex_answer?: string
    difficulty?: number
  }>
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
        newQuestions: 0,
        isMathematicallyCorrect: true,
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
        newQuestions: 0,
        isMathematicallyCorrect: false,
      }
    }
  }

  // 3. Context ophalen voor de prompt
  const { data: question } = await db
    .from('questions')
    .select('id, body, answer, topic_id, cluster_id, difficulty')
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

  // 4. Aantal beschikbare vragen én check of stappenplan al bestaat
  const [availabilityPerDifficulty, stepsCheck] = await Promise.all([
    countAvailablePerDifficulty(db, question.cluster_id),
    db.from('question_steps').select('id').eq('question_id', question.id).limit(1),
  ])
  const stepsAlreadyExist = (stepsCheck.data?.length ?? 0) > 0

  // 5. Prompt → Gemini
  const prompt = buildCheckAnswerPrompt({
    questionBody: question.body,
    correctAnswer: question.answer,
    studentAnswer,
    topicTitle: topic?.title ?? '',
    clusterTitle: cluster?.title ?? '',
    rootCauses: (rootCauses ?? []).map((r) => ({
      slug: r.slug,
      description: r.description,
    })),
    availability: availabilityPerDifficulty,
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
      newQuestions: 0,
      isMathematicallyCorrect: true,
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
  if (!stepsAlreadyExist) {
    const steps = (ai.data.solution_steps ?? []).filter(
      (s): s is string => typeof s === 'string' && s.trim().length > 0,
    )
    if (steps.length > 0) {
      await db.from('question_steps').insert(
        steps.map((step, i) => ({
          question_id: questionId,
          step_order: i + 1,
          step_description: step.trim(),
        })),
      )
    }
  }

  // 9. Nieuwe vragen opslaan indien Gemini ze genereert
  let newQuestions = 0
  if (
    ai.data.needs_new_questions &&
    Array.isArray(ai.data.generated_questions) &&
    ai.data.generated_questions.length > 0
  ) {
    const toInsert = ai.data.generated_questions
      .filter(
        (q): q is Required<Pick<NonNullable<typeof q>, 'body' | 'answer' | 'difficulty'>> & typeof q =>
          Boolean(q.body && q.answer && (q.difficulty === 1 || q.difficulty === 2 || q.difficulty === 3)),
      )
      .map((q) => ({
        topic_id: question.topic_id,
        cluster_id: question.cluster_id,
        body: q.body!,
        latex_body: stripMathDelimiters(q.latex_body),
        answer: q.answer!,
        latex_answer: stripMathDelimiters(q.latex_answer),
        difficulty: q.difficulty as 1 | 2 | 3,
        root_cause_tags: rootCauseSlug ? [rootCauseSlug] : [],
        is_ai_generated: true,
      }))

    if (toInsert.length) {
      const { error, data } = await db
        .from('questions')
        .insert(toInsert)
        .select('id')
      if (!error) newQuestions = data?.length ?? 0
    }
  }

  return {
    errorExplanation: explanation,
    rootCauseSlug,
    fromCache: false,
    newQuestions,
    isMathematicallyCorrect: false,
  }
}

/**
 * Gemini plakt soms `$...$` of `$$...$$` om zijn LaTeX-output, terwijl onze
 * `latex_body` / `latex_answer` kolommen schone LaTeX verwachten. Strip die
 * omliggende delimiters zodat KaTeX de string direct kan renderen.
 */
function stripMathDelimiters(raw: string | null | undefined): string | null {
  if (!raw) return null
  let s = raw.trim()
  if (!s) return null
  if (s.startsWith('$$') && s.endsWith('$$') && s.length >= 4) {
    s = s.slice(2, -2).trim()
  } else if (s.startsWith('$') && s.endsWith('$') && s.length >= 2) {
    s = s.slice(1, -1).trim()
  }
  return s || null
}

async function countAvailablePerDifficulty(
  db: DB,
  clusterId: string,
): Promise<Record<1 | 2 | 3, number>> {
  const { data } = await db
    .from('questions')
    .select('difficulty')
    .eq('cluster_id', clusterId)

  const counts: Record<1 | 2 | 3, number> = { 1: 0, 2: 0, 3: 0 }
  for (const q of data ?? []) {
    if (q.difficulty === 1 || q.difficulty === 2 || q.difficulty === 3) {
      counts[q.difficulty] += 1
    }
  }
  return counts
}
