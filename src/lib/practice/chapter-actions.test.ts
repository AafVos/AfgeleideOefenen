import { beforeEach, describe, expect, it, vi } from 'vitest'

// =====================================================================
// Nakijken van een antwoord: wat doet dat met de voortgang?
//
// Alleen de boekhouding wordt getest: een nepdatabase in het geheugen en
// een nep-AI. Geen Supabase, geen Gemini.
// =====================================================================

type ProgressRow = {
  id: string
  status: string
  correct_streak: number
  total_answered: number
  total_correct: number
  mastered_at: string | null
}

type AnswerRow = { id: string; user_answer: string; is_correct: boolean }

type QueryResult = { data: unknown; error: null }

const QUESTION = {
  id: 'q1',
  topic_id: 't1',
  cluster_id: 'c1',
  answer: '6x',
  latex_answer: '6x',
  answer_alternatives: [] as string[],
}

let progress: ProgressRow
let answers: AnswerRow[]
let aiSaysCorrect: boolean

function freshProgress(correctStreak: number, totalAnswered: number): ProgressRow {
  return {
    id: 'p1',
    status: 'in_progress',
    correct_streak: correctStreak,
    total_answered: totalAnswered,
    total_correct: totalAnswered,
    mastered_at: null,
  }
}

/** Minimale nabootsing van de query-builder van Supabase. */
function from(table: string) {
  let op: 'select' | 'insert' | 'update' = 'select'
  let values: Record<string, unknown> = {}

  function run(): QueryResult {
    if (table === 'questions_new') return { data: QUESTION, error: null }

    if (table === 'user_sessions_new') {
      // Geen open sessie: de actie maakt er een aan.
      return { data: op === 'insert' ? { id: 's1' } : null, error: null }
    }

    if (table === 'session_answers_new') {
      if (op === 'insert') {
        const row: AnswerRow = {
          id: `a${answers.length + 1}`,
          user_answer: String(values.user_answer),
          is_correct: values.is_correct === true,
        }
        answers.push(row)
        return { data: { id: row.id }, error: null }
      }
      if (op === 'update') Object.assign(answers[answers.length - 1], values)
      return { data: null, error: null }
    }

    if (table === 'user_progress_new') {
      if (op === 'update') Object.assign(progress, values)
      return { data: { ...progress }, error: null }
    }

    return { data: null, error: null }
  }

  const builder = {
    select: () => builder,
    eq: () => builder,
    is: () => builder,
    gte: () => builder,
    order: () => builder,
    limit: () => builder,
    insert: (v: Record<string, unknown>) => {
      op = 'insert'
      values = v
      return builder
    },
    update: (v: Record<string, unknown>) => {
      op = 'update'
      values = v
      return builder
    },
    single: async () => run(),
    maybeSingle: async () => run(),
    then: (resolve: (value: QueryResult) => unknown) => Promise.resolve(run()).then(resolve),
  }

  return builder
}

const fakeClient = {
  auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
  from,
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => fakeClient,
  createServiceRoleClient: () => fakeClient,
}))

vi.mock('@/lib/ai/check-answer-new', () => ({
  checkWrongAnswerNew: async () => ({
    errorExplanation: aiSaysCorrect ? '' : 'Je hebt de macht laten staan.',
    category: null,
    fromCache: false,
    isMathematicallyCorrect: aiSaysCorrect,
    generatedSteps: [],
  }),
}))

const { submitStudyAnswerAction } = await import('./chapter-actions')

describe('submitStudyAnswerAction', () => {
  beforeEach(() => {
    progress = freshProgress(2, 2)
    answers = []
    aiSaysCorrect = false
  })

  it('telt een antwoord dat meteen goed is één keer mee', async () => {
    const result = await submitStudyAnswerAction('q1', '6x')

    expect(result).toMatchObject({ kind: 'correct', streak: 3, mastered: true })
    expect(progress.total_answered).toBe(3)
    expect(progress.total_correct).toBe(3)
  })

  it('telt een goed antwoord in een andere notatie ook maar één keer mee', async () => {
    // De database kent alleen "6x"; de leerling schrijft "3·2x". De AI zegt
    // dat dat hetzelfde is.
    aiSaysCorrect = true

    const result = await submitStudyAnswerAction('q1', '3cdot2x')

    expect(result).toMatchObject({ kind: 'correct', streak: 3, mastered: true })
    // Eén opgave erbij, niet twee.
    expect(progress.total_answered).toBe(3)
    expect(progress.total_correct).toBe(3)
    // De reeks loopt door, dus "beheerst" is haalbaar.
    expect(progress.status).toBe('mastered')
    expect(answers).toHaveLength(1)
    expect(answers[0].is_correct).toBe(true)
  })

  it('zet de reeks terug op 0 bij een echt fout antwoord', async () => {
    const result = await submitStudyAnswerAction('q1', '3x')

    expect(result).toMatchObject({ kind: 'incorrect', correctAnswer: '6x' })
    expect(progress.correct_streak).toBe(0)
    expect(progress.total_answered).toBe(3)
    expect(progress.total_correct).toBe(2)
  })
})
