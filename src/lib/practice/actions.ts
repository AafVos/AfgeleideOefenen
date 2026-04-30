'use server'

import { revalidatePath } from 'next/cache'

import { checkWrongAnswer } from '@/lib/ai/check-answer'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

import {
  answersMatch,
  getOrCreateSession,
  MASTERY_THRESHOLD,
} from './engine'

export type SubmitResult =
  | {
      kind: 'correct'
      answerId: string
      streak: number
      mastered: boolean
    }
  | {
      kind: 'incorrect'
      answerId: string
      correctAnswer: string
      latexCorrectAnswer: string | null
      errorExplanation: string | null
      rootCauseSlug: string | null
    }
  | { kind: 'error'; message: string }

// =====================================================================
// Submit an answer
// =====================================================================
export async function submitAnswerAction(
  questionId: string,
  userAnswerRaw: string,
  timeSpentSec?: number,
): Promise<SubmitResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { kind: 'error', message: 'Niet ingelogd.' }

  const { data: question } = await supabase
    .from('questions')
    .select(
      'id, topic_id, cluster_id, answer, latex_answer',
    )
    .eq('id', questionId)
    .maybeSingle()
  if (!question) return { kind: 'error', message: 'Vraag niet gevonden.' }

  const isCorrect = answersMatch(userAnswerRaw, question.answer)

  const sessionId = await getOrCreateSession(
    supabase,
    user.id,
    question.topic_id,
    question.cluster_id,
  )

  const { data: answerRow, error: answerError } = await supabase
    .from('session_answers')
    .insert({
      session_id: sessionId,
      question_id: question.id,
      user_answer: userAnswerRaw,
      is_correct: isCorrect,
      time_spent_sec: timeSpentSec ?? null,
    })
    .select('id')
    .single()

  if (answerError || !answerRow) {
    return {
      kind: 'error',
      message: answerError?.message ?? 'Kon antwoord niet opslaan.',
    }
  }

  if (isCorrect) {
    const progress = await bumpProgressOnCorrect(
      supabase,
      user.id,
      question.topic_id,
      question.cluster_id,
    )
    revalidatePath('/leerpad')
    revalidatePath('/oefenen')
    revalidatePath('/dashboard')
    return {
      kind: 'correct',
      answerId: answerRow.id,
      streak: progress.correct_streak,
      mastered: progress.status === 'mastered',
    }
  }

  // Fout: streak wordt pas gereset wanneer de student de fout "resolvet"
  // (stapkiezer of slordigheidsfout). We tellen het antwoord alvast in de
  // progress.total_answered om die teller eerlijk te houden.
  await bumpTotals(supabase, user.id, question.topic_id, question.cluster_id)

  // Vraag de AI-laag om een uitleg (eerst cache, anders Gemini). Schrijfacties
  // gaan naar admin-only tabellen (questions, known_wrong_answers) dus gebruiken
  // we de service role client.
  let errorExplanation: string | null = null
  let rootCauseSlug: string | null = null
  try {
    const service = createServiceRoleClient()
    const aiResult = await checkWrongAnswer(service, question.id, userAnswerRaw)
    if ('error' in aiResult) {
      console.error('[check-answer]', aiResult.error)
    } else {
      errorExplanation = aiResult.errorExplanation
      rootCauseSlug = aiResult.rootCauseSlug
    }
  } catch (e) {
    console.error('[check-answer] unexpected', e)
  }

  return {
    kind: 'incorrect',
    answerId: answerRow.id,
    correctAnswer: question.answer,
    latexCorrectAnswer: question.latex_answer,
    errorExplanation,
    rootCauseSlug,
  }
}

// =====================================================================
// Markeer fout als slordigheidsfoutje
// =====================================================================
export async function markCarelessAction(answerId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Niet ingelogd.')

  const { error } = await supabase
    .from('session_answers')
    .update({ is_careless: true })
    .eq('id', answerId)
  if (error) throw new Error(error.message)

  revalidatePath('/leerpad')
  revalidatePath('/oefenen')
}

// =====================================================================
// Markeer welke stappen fout gingen (reset streak)
// =====================================================================
export async function resolveWithStepsAction(
  answerId: string,
  wrongStepIds: string[],
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Niet ingelogd.')

  // Haal answer + question op om het cluster te weten.
  const { data: answer } = await supabase
    .from('session_answers')
    .select('id, question_id')
    .eq('id', answerId)
    .maybeSingle()
  if (!answer) throw new Error('Antwoord niet gevonden.')

  const { data: question } = await supabase
    .from('questions')
    .select('topic_id, cluster_id')
    .eq('id', answer.question_id)
    .maybeSingle()
  if (!question) throw new Error('Vraag niet gevonden.')

  if (wrongStepIds.length) {
    const rows = wrongStepIds.map((stepId) => ({
      answer_id: answerId,
      step_id: stepId,
    }))
    const { error } = await supabase.from('step_mistakes').insert(rows)
    if (error) throw new Error(error.message)
  }

  await resetStreak(supabase, user.id, question.cluster_id)
  revalidatePath('/leerpad')
  revalidatePath('/oefenen')
}

// =====================================================================
// Hulpfuncties op user_progress
// =====================================================================
async function getOrCreateProgress(
  db: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  topicId: string,
  clusterId: string,
) {
  const { data } = await db
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('cluster_id', clusterId)
    .maybeSingle()

  if (data) return data

  const { data: created, error } = await db
    .from('user_progress')
    .insert({
      user_id: userId,
      topic_id: topicId,
      cluster_id: clusterId,
      status: 'in_progress',
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return created
}

async function bumpProgressOnCorrect(
  db: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  topicId: string,
  clusterId: string,
) {
  const p = await getOrCreateProgress(db, userId, topicId, clusterId)
  const newStreak = p.correct_streak + 1
  const mastered = newStreak >= MASTERY_THRESHOLD
  const { data, error } = await db
    .from('user_progress')
    .update({
      correct_streak: newStreak,
      total_answered: p.total_answered + 1,
      total_correct: p.total_correct + 1,
      status: mastered ? 'mastered' : 'in_progress',
      mastered_at: mastered && !p.mastered_at ? new Date().toISOString() : p.mastered_at,
    })
    .eq('id', p.id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

async function bumpTotals(
  db: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  topicId: string,
  clusterId: string,
) {
  const p = await getOrCreateProgress(db, userId, topicId, clusterId)
  const { error } = await db
    .from('user_progress')
    .update({ total_answered: p.total_answered + 1 })
    .eq('id', p.id)
  if (error) throw new Error(error.message)
}

async function resetStreak(
  db: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  clusterId: string,
) {
  const { data } = await db
    .from('user_progress')
    .select('id, correct_streak, status')
    .eq('user_id', userId)
    .eq('cluster_id', clusterId)
    .maybeSingle()

  if (!data) return

  // Als de student al mastered was laten we dat staan; maar fout antwoord
  // in een nieuw streak-opbouw moment resetten.
  if (data.status === 'mastered') return

  const { error } = await db
    .from('user_progress')
    .update({ correct_streak: 0 })
    .eq('id', data.id)
  if (error) throw new Error(error.message)
}
