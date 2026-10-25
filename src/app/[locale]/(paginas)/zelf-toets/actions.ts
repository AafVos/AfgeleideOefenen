'use server'

import { pickQuestionsForTest, type QuestionSource } from '@/lib/practice/custom-test'
import {
  bewaarAntwoord,
  kijkAntwoordNa,
  type Nakijkuitslag,
  rekenAlsnogGoed,
  vangOpslag,
} from '@/lib/practice/nakijken'
import { requireUser } from '@/lib/supabase/require-user'
import { createClient } from '@/lib/supabase/server'

const MAX_QUESTIONS = 50
const VALID_SOURCES: QuestionSource[] = ['new', 'all', 'wrong']
const AANMAAK_MISLUKT = 'Het maken van je toets lukte niet. Probeer het nog een keer.'

type DbFout = {
  code?: string
  message?: string
  details?: string | null
  hint?: string | null
} | null

function logAanmaakFout(
  fout: DbFout,
  questionCount: number,
  fallbackCode: string,
  fallbackMessage: string,
) {
  console.error('[zelf-toets create]', {
    code: fout?.code ?? fallbackCode,
    message: fout?.message ?? fallbackMessage,
    details: fout?.details ?? null,
    hint: fout?.hint ?? null,
    questionCount,
  })
}

export type CreateTestPayload = {
  clusterIds: string[]
  count: number
  source: QuestionSource
  name: string
  showAnswers: 'immediate' | 'end'
}

async function createTestSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  questionIds: string[],
  name: string,
  showAnswers: 'immediate' | 'end',
): Promise<{ sessionId: string } | { error: string }> {
  const { data: session, error: sessionErr } = await supabase
    .from('user_sessions_new')
    .insert({ user_id: userId, session_type: 'custom_test', name, show_answers: showAnswers })
    .select('id')
    .single()
  if (sessionErr || !session) {
    logAanmaakFout(
      sessionErr,
      questionIds.length,
      'SESSION_INSERT_FAILED',
      'Kon sessie niet aanmaken',
    )
    return { error: AANMAAK_MISLUKT }
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
    logAanmaakFout(insertErr, questionIds.length, 'QUESTION_INSERT_FAILED', 'Kon vragen niet opslaan')
    await ruimSessieOp(supabase, session.id, questionIds.length)
    return { error: AANMAAK_MISLUKT }
  }

  const { count: actualCount, error: countErr } = await supabase
    .from('custom_test_questions')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', session.id)
  if (countErr || (actualCount ?? 0) !== questionIds.length) {
    logAanmaakFout(
      countErr,
      questionIds.length,
      'COUNT_MISMATCH',
      `Verwacht ${questionIds.length} vragen, ${actualCount ?? 0} opgeslagen`,
    )
    await ruimSessieOp(supabase, session.id, questionIds.length)
    return { error: AANMAAK_MISLUKT }
  }

  return { sessionId: session.id }
}

async function ruimSessieOp(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  questionCount: number,
) {
  const { error } = await supabase.from('user_sessions_new').delete().eq('id', sessionId)
  if (error) {
    logAanmaakFout(error, questionCount, 'SESSION_DELETE_FAILED', 'Kon de mislukte toets niet weghalen')
  }
}

export async function createCustomTestAction(
  payload: CreateTestPayload,
): Promise<{ error: string } | { sessionId: string }> {
  const supabase = await createClient()
  const user = await requireUser()

  if (!Array.isArray(payload.clusterIds) || payload.clusterIds.length === 0) {
    return { error: 'Kies minstens één theorieblok.' }
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

  const uniqueIds = [...new Set(questionIds)]

  const trimmedName = payload.name?.trim() || 'Zelf-toets'
  const showAnswers = payload.showAnswers === 'end' ? 'end' : 'immediate'

  const result = await createTestSession(supabase, user.id, uniqueIds, trimmedName, showAnswers)
  if ('sessionId' in result) return { sessionId: result.sessionId }

  const retryResult = await createTestSession(supabase, user.id, uniqueIds, trimmedName, showAnswers)
  if ('sessionId' in retryResult) return { sessionId: retryResult.sessionId }

  return { error: AANMAAK_MISLUKT }
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
      /** Korte zin als er iets niet lukte, bijvoorbeeld de extra controle. */
      melding: string | null
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

  let question: { id: string; answer: string; latex_answer: string | null; answer_alternatives: string[] | null }
  let uitslag: Nakijkuitslag
  try {
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

    const { data: gevondenVraag } = await supabase
      .from('questions_new')
      .select('id, answer, latex_answer, answer_alternatives')
      .eq('id', questionId)
      .maybeSingle()
    if (!gevondenVraag) return { kind: 'error', message: 'Vraag niet gevonden.' }
    question = gevondenVraag

    let answerId = ''
    uitslag = await kijkAntwoordNa({
      questionId: question.id,
      userAnswer,
      correctAnswer: question.answer,
      alternatives: question.answer_alternatives,
      bewaar: async (goed) => {
        answerId = await bewaarAntwoord(supabase, '[zelf-toets] antwoord opslaan mislukt:', {
          sessionId,
          questionId: question.id,
          userAnswer,
          isCorrect: goed,
          timeSpentSec,
        })
      },
    })
    if (uitslag.viaExtraControle)
      await rekenAlsnogGoed(supabase, '[zelf-toets] alsnog goed rekenen mislukt:', answerId)
  } catch (e) {
    return vangOpslag('[zelf-toets] nakijken mislukt:', e)
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

  if (uitslag.goed) {
    return { kind: 'correct', done }
  }
  return {
    kind: 'incorrect',
    done,
    correctAnswer: question.answer,
    latexCorrectAnswer: question.latex_answer ?? null,
    melding: uitslag.melding,
  }
}
