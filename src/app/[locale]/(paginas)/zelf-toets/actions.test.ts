import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const userId = 'leerling-1'
const mislukt = 'Het maken van je toets lukte niet. Probeer het nog een keer.'

type Sessie = {
  id: string
  user_id: string
  session_type: string
  name: string
  show_answers: string
}

type VraagRij = {
  session_id: string
  question_id: string
  order_index: number
}

type DbFout = {
  code: string
  message: string
  details: string | null
  hint: string | null
}

type AanmaakLog = DbFout & { questionCount: number }

type QueryResult = {
  data: { id: string } | VraagRij[] | Record<string, unknown> | null
  error: DbFout | null
  count?: number | null
}

/** Een opgeslagen antwoord in de nepdatabase. */
type AntwoordRij = { id: string; is_correct: boolean | null }

const db = vi.hoisted(() => ({
  sessions: [] as Sessie[],
  questions: [] as VraagRij[],
  deletedIds: [] as string[],
  logs: [] as AanmaakLog[],
  insertFailCount: 0,
  antwoordFout: null as string | null,
  countFailCount: 0,
  countErrorCount: 0,
  deleteFailCount: 0,
  sid: 0,
  picked: ['q1', 'q2', 'q3', 'q2'] as string[],
  /** Zet de rijen klaar die het nakijken van één antwoord nodig heeft. */
  nakijken: false,
  antwoorden: [] as AntwoordRij[],
  /** Wat de nep-AI zegt over een fout antwoord, of een fout. */
  aiZegtGoed: false,
  aiValtOm: false,
  /** De allereerste opzoeking (de sessie) gooit een fout (netwerk). */
  sessieOphalenValtOm: false,
}))

function reset() {
  db.sessions = []
  db.questions = []
  db.deletedIds = []
  db.logs = []
  db.insertFailCount = 0
  db.antwoordFout = null
  db.countFailCount = 0
  db.countErrorCount = 0
  db.deleteFailCount = 0
  db.sid = 0
  db.picked = ['q1', 'q2', 'q3', 'q2']
  db.nakijken = false
  db.antwoorden = []
  db.aiZegtGoed = false
  db.aiValtOm = false
  db.sessieOphalenValtOm = false
}

function invoegFout(): DbFout {
  return { code: '23505', message: 'duplicate key value', details: 'd', hint: 'h' }
}

function makeClient() {
  function from(table: string) {
    let op = ''
    let vals: unknown
    let filterWaarde = ''
    let head = false
    let countMode = ''

    function uitvoeren(): QueryResult {
      if (table === 'user_sessions_new' && op === 'insert') {
        db.sid += 1
        const waarde = vals as Omit<Sessie, 'id'>
        const id = `s${db.sid}`
        db.sessions.push({ id, ...waarde })
        return { data: { id }, error: null }
      }

      if (table === 'user_sessions_new' && op === 'delete') {
        if (db.deleteFailCount > 0) {
          db.deleteFailCount -= 1
          return {
            data: null,
            error: { code: '42501', message: 'permission denied', details: null, hint: null },
          }
        }
        if (filterWaarde) {
          db.deletedIds.push(filterWaarde)
          db.sessions = db.sessions.filter((sessie) => sessie.id !== filterWaarde)
          db.questions = db.questions.filter((vraag) => vraag.session_id !== filterWaarde)
        }
        return { data: null, error: null }
      }

      if (table === 'custom_test_questions' && op === 'insert') {
        if (db.insertFailCount > 0) {
          db.insertFailCount -= 1
          return { data: null, error: invoegFout() }
        }
        const rijen = Array.isArray(vals) ? (vals as VraagRij[]) : []
        db.questions.push(...rijen)
        return { data: null, error: null }
      }

      if (table === 'custom_test_questions' && op === 'select' && head && countMode === 'exact') {
        if (db.countErrorCount > 0) {
          db.countErrorCount -= 1
          return {
            data: null,
            count: null,
            error: { code: '57014', message: 'statement timeout', details: null, hint: null },
          }
        }
        const aanwezig = db.questions.filter((vraag) => vraag.session_id === filterWaarde).length
        const aantal = db.countFailCount > 0 ? 0 : aanwezig
        if (db.countFailCount > 0) db.countFailCount -= 1
        return { data: null, count: aantal, error: null }
      }

      if (db.nakijken && table === 'user_sessions_new' && op === 'select') {
        if (db.sessieOphalenValtOm) throw new Error('fetch failed')
        return {
          data: {
            id: filterWaarde,
            user_id: userId,
            session_type: 'custom_test',
            ended_at: null,
          },
          error: null,
        }
      }
      if (db.nakijken && table === 'custom_test_questions' && op === 'select') {
        return { data: { question_id: 'q1' }, error: null }
      }
      if (db.nakijken && table === 'questions_new' && op === 'select') {
        return {
          data: {
            id: 'q1',
            answer: '6x',
            latex_answer: '6x',
            answer_alternatives: [],
          },
          error: null,
        }
      }
      if (db.nakijken && table === 'session_answers_new') {
        if (op === 'insert') {
          if (db.antwoordFout) {
            return {
              data: null,
              error: { code: '23505', message: db.antwoordFout, details: null, hint: null },
            }
          }
          const rij = {
            id: `a${db.antwoorden.length + 1}`,
            is_correct: ((vals as Record<string, unknown>).is_correct ?? null) as boolean | null,
          }
          db.antwoorden.push(rij)
          return { data: { id: rij.id }, error: null }
        }
        if (op === 'update') {
          const rij = db.antwoorden.find((a) => a.id === filterWaarde)
          if (rij) rij.is_correct = true
          return { data: null, error: null }
        }
        // Een telling aan het eind; verder: nog geen antwoord op deze vraag.
        if (head) return { data: null, count: db.antwoorden.length, error: null }
        return { data: null, error: null }
      }

      return { data: null, error: null }
    }

    const keten = {
      insert(waarde: unknown) {
        op = 'insert'
        vals = waarde
        return keten
      },
      update(waarde: unknown) {
        op = 'update'
        vals = waarde
        return keten
      },
      delete() {
        op = 'delete'
        return keten
      },
      select(_kolommen?: string, opties?: { head?: boolean; count?: string }) {
        if (op !== 'insert') op = 'select'
        head = opties?.head ?? false
        countMode = opties?.count ?? ''
        return keten
      },
      eq(_kolom: string, waarde: string) {
        filterWaarde = waarde
        return keten
      },
      single: () => Promise.resolve(uitvoeren()),
      maybeSingle: () => Promise.resolve(uitvoeren()),
      then(
        onFulfilled?: (waarde: QueryResult) => unknown,
        onRejected?: (reden: unknown) => unknown,
      ) {
        return Promise.resolve(uitvoeren()).then(onFulfilled, onRejected)
      },
    }

    return keten
  }

  return {
    auth: { getUser: async () => ({ data: { user: { id: userId } } }) },
    from,
  }
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => makeClient(),
  createServiceRoleClient: () => makeClient(),
}))

// Hierlangs haalt `requireUser()` de ingelogde leerling op.
vi.mock('@/lib/supabase/request-cache', () => ({
  getCurrentUser: async () => ({ id: userId }),
}))

vi.mock('@/lib/practice/custom-test', () => ({
  pickQuestionsForTest: async () => db.picked,
}))

vi.mock('@/lib/ai/check-answer-new', () => ({
  checkWrongAnswerNew: async () => {
    if (db.aiValtOm) throw new Error('fetch failed')
    return {
      errorExplanation: db.aiZegtGoed ? '' : 'Je hebt de macht laten staan.',
      category: null,
      fromCache: false,
      isMathematicallyCorrect: db.aiZegtGoed,
      generatedSteps: [],
    }
  },
}))

vi.mock('next-intl/server', () => ({
  getLocale: async () => 'nl',
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

const { EXTRA_CONTROLE_MISLUKT } = await import('@/lib/practice/nakijken')
const { createCustomTestAction, submitCustomTestAnswerAction } = await import('./actions')

const payload = {
  clusterIds: ['c1'],
  count: 10,
  source: 'all' as const,
  name: 'Mijn toets',
  showAnswers: 'immediate' as const,
}

describe('createCustomTestAction', () => {
  beforeEach(() => {
    reset()
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      const payloadLog = args[1]
      if (payloadLog && typeof payloadLog === 'object') db.logs.push(payloadLog as AanmaakLog)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maakt een toets met unieke vragen', async () => {
    const res = await createCustomTestAction(payload)

    expect(res).toEqual({ sessionId: 's1' })
    expect(db.questions.map((vraag) => vraag.question_id)).toEqual(['q1', 'q2', 'q3'])
    expect(db.questions.map((vraag) => vraag.order_index)).toEqual([0, 1, 2])
    expect(db.deletedIds).toEqual([])
    expect(db.logs).toEqual([])
  })

  it('gebruikt Zelf-toets als standaardnaam', async () => {
    await createCustomTestAction({ ...payload, name: '   ' })
    expect(db.sessions[0]?.name).toBe('Zelf-toets')
  })

  it('vraagt om minstens één theorieblok', async () => {
    const res = await createCustomTestAction({ ...payload, clusterIds: [] })
    expect(res).toEqual({ error: 'Kies minstens één theorieblok.' })
    expect(db.sessions).toEqual([])
  })

  it('weigert een ongeldige bron', async () => {
    const res = await createCustomTestAction({ ...payload, source: 'bla' as never })
    expect(res).toEqual({ error: 'Ongeldige bron.' })
  })

  it('zegt het als er geen vragen zijn', async () => {
    db.picked = []
    const res = await createCustomTestAction(payload)
    expect(res).toEqual({ error: 'Geen vragen beschikbaar voor deze selectie.' })
    expect(db.sessions).toEqual([])
  })

  it('haalt een mislukte toets weg en probeert het nog een keer', async () => {
    db.insertFailCount = 1

    const res = await createCustomTestAction(payload)

    expect(res).toEqual({ sessionId: 's2' })
    expect(db.deletedIds).toEqual(['s1'])
    expect(db.sessions.map((sessie) => sessie.id)).toEqual(['s2'])
    expect(db.questions).toHaveLength(3)
    expect(db.questions.every((vraag) => vraag.session_id === 's2')).toBe(true)
    expect(db.logs).toHaveLength(1)
    expect(JSON.stringify(res)).not.toContain('duplicate key')
  })

  it('laat geen lege toets staan als beide pogingen mislukken', async () => {
    db.insertFailCount = 2

    const res = await createCustomTestAction(payload)

    expect(res).toEqual({ error: mislukt })
    expect(db.deletedIds).toEqual(['s1', 's2'])
    expect(db.sessions).toEqual([])
    expect(db.questions).toEqual([])
    expect(db.logs).toHaveLength(2)
  })

  it('logt de echte fout zonder leerlinggegevens', async () => {
    db.insertFailCount = 2
    await createCustomTestAction(payload)

    expect(db.logs[0]).toEqual({
      code: '23505',
      message: 'duplicate key value',
      details: 'd',
      hint: 'h',
      questionCount: 3,
    })
    expect(JSON.stringify(db.logs)).not.toContain(userId)
    expect(JSON.stringify(db.logs)).not.toContain('user_id')
  })

  it('haalt de toets weg als niet alle vragen zijn opgeslagen', async () => {
    db.countFailCount = 1

    const res = await createCustomTestAction(payload)

    expect(res).toEqual({ sessionId: 's2' })
    expect(db.deletedIds).toEqual(['s1'])
    expect(db.questions.every((vraag) => vraag.session_id === 's2')).toBe(true)
    expect(db.logs[0]).toMatchObject({
      code: 'COUNT_MISMATCH',
      questionCount: 3,
    })
  })

  it('logt een mislukte telling en ruimt de toets op', async () => {
    db.countErrorCount = 2

    const res = await createCustomTestAction(payload)

    expect(res).toEqual({ error: mislukt })
    expect(db.deletedIds).toEqual(['s1', 's2'])
    expect(db.sessions).toEqual([])
    expect(db.logs[0]).toMatchObject({
      code: '57014',
      message: 'statement timeout',
      questionCount: 3,
    })
  })

  it('schrijft een toets van vijftig vragen weg, ook na een mislukte eerste poging', async () => {
    db.picked = [...Array.from({ length: 50 }, (_, i) => `vraag-${i}`), 'vraag-0']
    db.insertFailCount = 1

    const res = await createCustomTestAction({ ...payload, count: 50 })

    expect(res).toEqual({ sessionId: 's2' })
    expect(db.deletedIds).toEqual(['s1'])
    expect(db.sessions).toHaveLength(1)
    expect(db.questions).toHaveLength(50)
    expect(db.questions.map((vraag) => vraag.order_index)).toEqual(
      Array.from({ length: 50 }, (_, i) => i),
    )
    expect(new Set(db.questions.map((vraag) => vraag.question_id)).size).toBe(50)
    expect(db.logs[0]?.questionCount).toBe(50)
    expect(JSON.stringify(db.logs)).not.toContain(userId)
  })

  it('meldt het opruimen als de lege toets niet weggehaald kan worden', async () => {
    db.insertFailCount = 1
    db.deleteFailCount = 1

    const res = await createCustomTestAction(payload)

    expect(res).toEqual({ sessionId: 's2' })
    expect(db.sessions.map((sessie) => sessie.id)).toEqual(['s1', 's2'])
    expect(db.logs.map((regel) => regel.code)).toEqual(['23505', '42501'])
    expect(JSON.stringify(res)).not.toContain('permission denied')
  })
})

describe('submitCustomTestAnswerAction', () => {
  beforeEach(() => {
    reset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('zet een mislukte opslag om in een Nederlandse zin', async () => {
    const ruw = 'duplicate key value violates unique constraint "session_answers_new_pkey"'
    db.nakijken = true
    db.antwoordFout = ruw

    const result = await submitCustomTestAnswerAction('s1', 'q1', '6x')

    expect(result).toEqual({
      kind: 'error',
      message: 'Opslaan is niet gelukt. Probeer het nog eens.',
    })
    expect(JSON.stringify(result)).not.toContain('duplicate key')
    expect(vi.mocked(console.error).mock.calls.flat().join(' ')).toContain(
      'session_answers_new_pkey',
    )
  })

  it('rekent een antwoord dat meteen klopt goed', async () => {
    db.nakijken = true

    const result = await submitCustomTestAnswerAction('s1', 'q1', '6x')

    expect(result).toMatchObject({ kind: 'correct' })
    expect(db.antwoorden).toEqual([{ id: 'a1', is_correct: true }])
  })

  it('rekent een goed antwoord in een andere schrijfwijze alsnog goed', async () => {
    db.nakijken = true
    db.aiZegtGoed = true

    const result = await submitCustomTestAnswerAction('s1', 'q1', '3 \\cdot 2x')

    expect(result).toMatchObject({ kind: 'correct' })
    // Eerst fout opgeslagen, daarna bijgewerkt: geen tweede rij.
    expect(db.antwoorden).toEqual([{ id: 'a1', is_correct: true }])
  })

  it('zegt het tegen de leerling als de extra controle mislukt', async () => {
    db.nakijken = true
    db.aiValtOm = true

    const result = await submitCustomTestAnswerAction('s1', 'q1', '3x')

    expect(result).toMatchObject({
      kind: 'incorrect',
      correctAnswer: '6x',
      melding: EXTRA_CONTROLE_MISLUKT,
    })
    // Het antwoord van de leerling is wél bewaard.
    expect(db.antwoorden).toEqual([{ id: 'a1', is_correct: false }])
    expect(JSON.stringify(result)).not.toContain('fetch failed')
  })

  it('meldt niets extra als het antwoord gewoon fout is', async () => {
    db.nakijken = true

    const result = await submitCustomTestAnswerAction('s1', 'q1', '3x')

    expect(result).toMatchObject({ kind: 'incorrect', melding: null })
  })

  it('geeft een nette melding als de allereerste opzoeking (de sessie) omvalt', async () => {
    db.nakijken = true
    db.sessieOphalenValtOm = true

    const result = await submitCustomTestAnswerAction('s1', 'q1', '6x')

    expect(result).toEqual({
      kind: 'error',
      message: 'Opslaan is niet gelukt. Probeer het nog eens.',
    })
    expect(JSON.stringify(result)).not.toContain('fetch failed')
  })
})
