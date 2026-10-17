import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

type AnswerRow = {
  id: string
  user_answer: string | null
  is_correct: boolean | null
  hints_used: number
  time_spent_sec: number | null
}

type DbFout = { code: string; message: string }

type QueryResult = { data: unknown; error: DbFout | null }

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
/** De extra controle valt om (netwerk of Gemini). */
let aiValtOm: boolean
/** Engelse tekst die een mislukte antwoordinvoeg moet teruggeven. */
let antwoordInvoegfout: string | null
/** Fout bij het aanmaken van voortgang. De eerste lezing vindt dan niets. */
let voortgangInvoegfout: DbFout | null
let voortgangLezingen: number
/** Engelse tekst die een mislukte melding moet teruggeven. */
let vlagFout: string | null

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
        if (antwoordInvoegfout) {
          return {
            data: null,
            error: { code: '23505', message: antwoordInvoegfout },
          }
        }
        const row: AnswerRow = {
          id: `a${answers.length + 1}`,
          user_answer: (values.user_answer ?? null) as string | null,
          is_correct: (values.is_correct ?? null) as boolean | null,
          hints_used: (values.hints_used ?? 0) as number,
          time_spent_sec: (values.time_spent_sec ?? null) as number | null,
        }
        answers.push(row)
        return { data: { id: row.id }, error: null }
      }
      if (op === 'update') Object.assign(answers[answers.length - 1], values)
      return { data: null, error: null }
    }

    if (table === 'user_progress_new') {
      if (op === 'update') Object.assign(progress, values)
      if (op === 'insert' && voortgangInvoegfout) {
        return { data: null, error: voortgangInvoegfout }
      }
      if (op === 'select' && voortgangInvoegfout) {
        voortgangLezingen += 1
        if (voortgangLezingen === 1) return { data: null, error: null }
      }
      return { data: { ...progress }, error: null }
    }

    if (table === 'question_flags_new' && op === 'insert' && vlagFout) {
      return { data: null, error: { code: '42501', message: vlagFout } }
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
  checkWrongAnswerNew: async () => {
    if (aiValtOm) throw new Error('fetch failed')
    return {
      errorExplanation: aiSaysCorrect ? '' : 'Je hebt de macht laten staan.',
      category: null,
      fromCache: false,
      isMathematicallyCorrect: aiSaysCorrect,
      generatedSteps: [],
    }
  },
}))

const { flagQuestionNewAction, skipStudyQuestionAction, submitStudyAnswerAction } =
  await import('./chapter-actions')

function verseBoekhouding() {
  antwoordInvoegfout = null
  voortgangInvoegfout = null
  voortgangLezingen = 0
  vlagFout = null
}

describe('submitStudyAnswerAction', () => {
  beforeEach(() => {
    progress = freshProgress(2, 2)
    answers = []
    aiSaysCorrect = false
    aiValtOm = false
    verseBoekhouding()
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
    expect(progress.status).toBe('in_progress')
    expect(progress.total_answered).toBe(3)
    expect(progress.total_correct).toBe(2)
  })

  it('zegt het tegen de leerling als de extra controle mislukt', async () => {
    aiValtOm = true
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await submitStudyAnswerAction('q1', '3x')

    expect(result).toMatchObject({
      kind: 'incorrect',
      melding: 'Het lukte even niet om te controleren of je antwoord anders opgeschreven toch goed is.',
    })
    // Het antwoord is wél bewaard, en telt gewoon als poging.
    expect(answers).toHaveLength(1)
    expect(progress.total_answered).toBe(3)
    expect(JSON.stringify(result)).not.toContain('fetch failed')

    vi.restoreAllMocks()
  })

  it('meldt niets extra als het antwoord gewoon fout is', async () => {
    const result = await submitStudyAnswerAction('q1', '3x')

    expect(result).toMatchObject({ kind: 'incorrect', melding: null })
  })

  it('slaat op hoe lang de leerling over de opgave deed', async () => {
    await submitStudyAnswerAction('q1', '6x', 42.4)

    expect(answers[0].time_spent_sec).toBe(42)
  })

  it('laat de tijd leeg als de browser niets meestuurt', async () => {
    await submitStudyAnswerAction('q1', '6x')

    expect(answers[0].time_spent_sec).toBeNull()
  })

  it('laat "beheerst" staan bij een misser tijdens het herhalen', async () => {
    progress = { ...freshProgress(3, 3), status: 'mastered', mastered_at: '2026-01-01' }

    const result = await submitStudyAnswerAction('q1', '3x')

    expect(result).toMatchObject({ kind: 'incorrect' })
    expect(progress.status).toBe('mastered')
    expect(progress.correct_streak).toBe(3)
    // De opgave telt wel mee.
    expect(progress.total_answered).toBe(4)
    expect(progress.total_correct).toBe(3)
  })
})

describe('skipStudyQuestionAction', () => {
  beforeEach(() => {
    progress = freshProgress(2, 2)
    answers = []
    aiSaysCorrect = false
    aiValtOm = false
    verseBoekhouding()
  })

  it('geeft het goede antwoord terug zonder iets fout te rekenen', async () => {
    const result = await skipStudyQuestionAction('q1')

    expect(result).toMatchObject({ kind: 'skipped', correctAnswer: '6x' })
    // Apart opgeslagen: geen antwoord, geen goed/fout, hulp opgevraagd.
    expect(answers).toHaveLength(1)
    expect(answers[0]).toMatchObject({
      user_answer: null,
      is_correct: null,
      hints_used: 1,
    })
  })

  it('slaat ook bij "Ik weet het niet" op hoe lang de opgave op het scherm stond', async () => {
    await skipStudyQuestionAction('q1', 17.2)

    expect(answers[0].time_spent_sec).toBe(17)
  })

  it('laat het percentage goed met rust en zet de reeks terug op 0', async () => {
    await skipStudyQuestionAction('q1')

    expect(progress.total_answered).toBe(2)
    expect(progress.total_correct).toBe(2)
    expect(progress.correct_streak).toBe(0)
    expect(progress.status).toBe('in_progress')
  })

  it('laat "beheerst" staan als de leerling tijdens het herhalen vastloopt', async () => {
    progress = { ...freshProgress(3, 3), status: 'mastered', mastered_at: '2026-01-01' }

    await skipStudyQuestionAction('q1')

    expect(progress.status).toBe('mastered')
    expect(progress.correct_streak).toBe(3)
    expect(progress.total_answered).toBe(3)
  })
})

const ENGELSE_DB_TEKST =
  'duplicate key value violates unique constraint "user_progress_new_user_id_cluster_id_key"'

describe('fouttekst van de database', () => {
  beforeEach(() => {
    progress = freshProgress(2, 2)
    answers = []
    aiSaysCorrect = false
    aiValtOm = false
    verseBoekhouding()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('zet een mislukte opslag om in een Nederlandse zin', async () => {
    antwoordInvoegfout = ENGELSE_DB_TEKST

    const result = await submitStudyAnswerAction('q1', '6x')

    expect(result).toEqual({
      kind: 'error',
      message: 'Opslaan is niet gelukt. Probeer het nog eens.',
    })
    expect(JSON.stringify(result)).not.toContain('duplicate key')
    expect(vi.mocked(console.error).mock.calls.flat().join(' ')).toContain(
      'user_progress_new_user_id_cluster_id_key',
    )
  })

  it('valt niet om als de voortgang net al bestaat', async () => {
    voortgangInvoegfout = { code: '23505', message: ENGELSE_DB_TEKST }

    const result = await submitStudyAnswerAction('q1', '6x')

    expect(result).toMatchObject({ kind: 'correct', streak: 3, mastered: true })
    expect(JSON.stringify(result)).not.toContain('duplicate key')
    expect(vi.mocked(console.error).mock.calls.flat().join(' ')).toContain(
      'user_progress_new_user_id_cluster_id_key',
    )
  })

  it('toont bij een andere opslagfout geen Engelse tekst', async () => {
    voortgangInvoegfout = {
      code: '42501',
      message: 'permission denied for table user_progress_new',
    }

    const result = await submitStudyAnswerAction('q1', '6x')

    expect(result).toEqual({
      kind: 'error',
      message: 'Opslaan is niet gelukt. Probeer het nog eens.',
    })
    expect(JSON.stringify(result)).not.toContain('permission denied')
  })

  it('zet een mislukte melding om in een Nederlandse zin', async () => {
    vlagFout = 'permission denied for table question_flags_new'

    const result = await flagQuestionNewAction('q1', 'de uitkomst klopt niet')

    expect(result).toEqual({
      ok: false,
      error: 'Versturen is niet gelukt. Probeer het later nog eens.',
    })
    expect(JSON.stringify(result)).not.toContain('permission denied')
  })
})
