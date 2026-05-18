'use server'

import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import { checkWrongAnswerNew } from '@/lib/ai/check-answer-new'
import { answersMatch } from '@/lib/practice/engine'
import { pickQuestionsForTest, type QuestionSource } from '@/lib/practice/custom-test'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const MAX_QUESTIONS = 50
const VALID_SOURCES: QuestionSource[] = ['new', 'all', 'wrong']

export type CreateTestPayload = {
  clusterIds: string[]
  count: number
  source: QuestionSource
  name: string
  showAnswers: 'immediate' | 'end'
}

export async function createCustomTestAction(
  payload: CreateTestPayload,
): Promise<{ error: string } | { sessionId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()
  if (!user) redirect(`/${locale}/inloggen`)

  if (!Array.isArray(payload.clusterIds) || payload.clusterIds.length === 0) {
    return { error: 'Kies minstens één onderwerp.' }
  }

  if (!VALID_SOURCES.includes(payload.source)) {
    return { error: 'Ongeldige bron.' }
  }

  const count = Math.min(MAX_QUESTIONS, Math.max(1, Math.floor(payload.count)))

  const questionIds = await pickQuestionsForTest(
    supabase,
    user.id,
    payload.clusterIds,
    payload.source,
    count,
  )

  if (questionIds.length === 0) {
    return { error: 'Geen vragen beschikbaar voor deze selectie.' }
  }

  const trimmedName = payload.name?.trim() || 'Zelf-toets'

  const showAnswers = payload.showAnswers === 'end' ? 'end' : 'immediate'

  const { data: session, error: sessionErr } = await supabase
    .from('user_sessions_new')
    .insert({ user_id: user.id, session_type: 'custom_test', name: trimmedName, show_answers: showAnswers })
    .select('id')
    .single()
  if (sessionErr || !session) {
    return { error: sessionErr?.message ?? 'Kon sessie niet aanmaken.' }
  }

  const rows = questionIds.map((qid, i) => ({
    session_id: session.id,
    question_id: qid,
    order_index: i,
  }))
  const { error: insertErr } = await supabase
    .from('custom_test_questions')
    .insert(rows)
  if (insertErr) {
    return { error: insertErr.message }
  }

  return { sessionId: session.id }
}

export type CustomTestAnswerResult =
  | {
      kind: 'correct'
      done: boolean
    }
  | {
      kind: 'incorrect'
      done: boolean
      correctAnswer: string
      latexCorrectAnswer: string | null
    }
  | { kind: 'error'; message: string }

export async function submitCustomTestAnswerAction(
  sessionId: string,
  questionId: string,
  userAnswer: string,
  timeSpentSec?: number,
): Promise<CustomTestAnswerResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { kind: 'error', message: 'Niet ingelogd.' }

  // Verify the session belongs to the user and is a custom test
  const { data: session } = await supabase
    .from('user_sessions_new')
    .select('id, user_id, session_type, ended_at')
    .eq('id', sessionId)
    .maybeSingle()
  if (!session || session.user_id !== user.id || session.session_type !== 'custom_test') {
    return { kind: 'error', message: 'Sessie niet gevonden.' }
  }
  if (session.ended_at) {
    return { kind: 'error', message: 'Toets is al afgerond.' }
  }

  // Verify the question is part of this test
  const { data: testRow } = await supabase
    .from('custom_test_questions')
    .select('question_id')
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .maybeSingle()
  if (!testRow) {
    return { kind: 'error', message: 'Vraag hoort niet bij deze toets.' }
  }

  // Prevent double-answering
  const { data: existing } = await supabase
    .from('session_answers_new')
    .select('id')
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .maybeSingle()
  if (existing) {
    return { kind: 'error', message: 'Deze vraag is al beantwoord.' }
  }

  const { data: question } = await supabase
    .from('questions_new')
    .select('id, answer, latex_answer, answer_alternatives')
    .eq('id', questionId)
    .maybeSingle()
  if (!question) return { kind: 'error', message: 'Vraag niet gevonden.' }

  const alts: string[] = question.answer_alternatives ?? []
  let isCorrect = answersMatch(userAnswer, question.answer, alts)

  const { data: answerRow, error: answerErr } = await supabase
    .from('session_answers_new')
    .insert({
      session_id: sessionId,
      question_id: question.id,
      user_answer: userAnswer,
      is_correct: isCorrect,
      time_spent_sec: timeSpentSec ?? null,
    })
    .select('id')
    .single()
  if (answerErr || !answerRow) {
    return { kind: 'error', message: answerErr?.message ?? 'Kon antwoord niet opslaan.' }
  }

  // For wrong answers, ask the AI if it's actually a valid alternative
  if (!isCorrect) {
    try {
      const service = createServiceRoleClient()
      const aiResult = await checkWrongAnswerNew(service, question.id, userAnswer)
      if (!('error' in aiResult) && aiResult.isMathematicallyCorrect) {
        await supabase
          .from('session_answers_new')
          .update({ is_correct: true })
          .eq('id', answerRow.id)
        isCorrect = true
      }
    } catch (e) {
      console.error('[zelf-toets check]', e)
    }
  }

  // Determine if this was the last question
  const [{ count: totalCount }, { count: answeredCount }] = await Promise.all([
    supabase
      .from('custom_test_questions')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId),
    supabase
      .from('session_answers_new')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId),
  ])

  const done = (totalCount ?? 0) > 0 && (answeredCount ?? 0) >= (totalCount ?? 0)
  if (done) {
    await supabase
      .from('user_sessions_new')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId)
  }

  if (isCorrect) {
    return { kind: 'correct', done }
  }
  return {
    kind: 'incorrect',
    done,
    correctAnswer: question.answer,
    latexCorrectAnswer: question.latex_answer ?? null,
  }
}
