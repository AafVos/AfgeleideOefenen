import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'

import { checkWrongAnswerNew } from './check-answer-new'

// =====================================================================
// Cache van het nakijken.
//
// Alleen de boekhouding wordt getest: een nepdatabase in het geheugen en
// de neppe controle uit stub.ts. Gemini wordt niet echt aangeroepen; in de
// tests hieronder die wél langs dat pad gaan, staat er een nepantwoord
// klaar (zie het tweede blok, "checkWrongAnswerNew met een antwoord van
// Gemini").
// =====================================================================

const gemini = vi.hoisted(() => ({
  generateJson: vi.fn<(prompt: string, opties?: unknown) => Promise<unknown>>(async () => {
    throw new Error('Gemini mag niet aangeroepen worden')
  }),
}))

vi.mock('./gemini', () => ({
  generateJson: gemini.generateJson,
}))

type Vraag = {
  id: string
  topic_id: string
  cluster_id: string
  latex_body: string | null
  answer: string
  answer_alternatives: string[]
}

type FoutAntwoord = {
  id: string
  question_id: string
  wrong_answer: string
  error_explanation: string
  category: string | null
  seen_count: number
}

type Rij = Record<string, unknown>

const vragen: Vraag[] = []
const fouteAntwoorden: FoutAntwoord[] = []
const stappen: Rij[] = []

const tabellen: Record<string, Rij[]> = {
  questions_new: vragen as unknown as Rij[],
  known_wrong_answers_new: fouteAntwoorden as unknown as Rij[],
  topics_new: [],
  topic_clusters_new: [],
  question_steps_new: stappen,
}

type QueryResultaat = { data: unknown; error: null }

/** Minimale nabootsing van de query-builder van Supabase. */
function from(tabel: string) {
  const rijen = tabellen[tabel]
  if (!rijen) throw new Error(`Onverwachte tabel: ${tabel}`)

  const filters: Array<[string, unknown]> = []
  let op: 'select' | 'insert' | 'update' | 'upsert' = 'select'
  let payload: unknown = null
  let onConflict: string | null = null
  let limiet: number | null = null

  function passend(): Rij[] {
    return rijen.filter((rij) => filters.every(([kolom, waarde]) => rij[kolom] === waarde))
  }

  function uitvoeren(): QueryResultaat {
    if (op === 'select') {
      const gevonden = passend()
      return { data: limiet === null ? gevonden : gevonden.slice(0, limiet), error: null }
    }

    if (op === 'update') {
      for (const rij of passend()) Object.assign(rij, payload)
      return { data: null, error: null }
    }

    if (op === 'insert') {
      const items = Array.isArray(payload) ? payload : [payload]
      for (const item of items) {
        rijen.push({ id: `nieuw-${rijen.length + 1}`, ...(item as Rij) })
      }
      return { data: null, error: null }
    }

    const item = payload as Rij
    const sleutels = (onConflict ?? '')
      .split(',')
      .map((sleutel) => sleutel.trim())
      .filter((sleutel) => sleutel.length > 0)
    const bestaand = rijen.find((rij) => sleutels.every((sleutel) => rij[sleutel] === item[sleutel]))
    if (bestaand) Object.assign(bestaand, item)
    else {
      // seen_count begint op 1, net als de echte tabel.
      rijen.push({ id: `nieuw-${rijen.length + 1}`, seen_count: 1, category: null, ...item })
    }
    return { data: null, error: null }
  }

  const bouwer = {
    select: () => bouwer,
    eq: (kolom: string, waarde: unknown) => {
      filters.push([kolom, waarde])
      return bouwer
    },
    limit: (n: number) => {
      limiet = n
      return bouwer
    },
    insert: (waarde: unknown) => {
      op = 'insert'
      payload = waarde
      return bouwer
    },
    update: (waarde: unknown) => {
      op = 'update'
      payload = waarde
      return bouwer
    },
    upsert: (waarde: unknown, opts?: { onConflict?: string }) => {
      op = 'upsert'
      payload = waarde
      onConflict = opts?.onConflict ?? null
      return bouwer
    },
    maybeSingle: async () => ({ data: passend()[0] ?? null, error: null }),
    then: (
      resolve: (waarde: QueryResultaat) => unknown,
      reject?: (reden: unknown) => unknown,
    ) => Promise.resolve(uitvoeren()).then(resolve, reject),
  }

  return bouwer
}

const db = { from } as unknown as SupabaseClient<Database>

function zetVraag(extra: Partial<Vraag> = {}): Vraag {
  const rij: Vraag = {
    id: 'q1',
    topic_id: 't1',
    cluster_id: 'c1',
    latex_body: 'f(x) = 2x^3',
    answer: '6x^2',
    answer_alternatives: [],
    ...extra,
  }
  vragen.push(rij)
  return rij
}

function verwachtGeenGemini() {
  expect(gemini.generateJson).not.toHaveBeenCalled()
}

/** Lege tabellen en een schone teller voor Gemini. */
function schoneStart() {
  vragen.length = 0
  fouteAntwoorden.length = 0
  stappen.length = 0
  tabellen.topics_new.length = 0
  tabellen.topic_clusters_new.length = 0
  gemini.generateJson.mockReset()
  vi.stubEnv('NODE_ENV', 'test')
}

describe('checkWrongAnswerNew', () => {
  beforeEach(() => {
    schoneStart()
    vi.stubEnv('AI_CHECK_MODE', 'stub')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('rekent een notatie die al bij de alternatieven staat meteen goed', async () => {
    // f(x) = (3/2)x^2 heeft afgeleide 3x. "3 x" en "3*x" zijn dezelfde notatie.
    const rij = zetVraag({
      latex_body: 'f(x) = \\frac{3}{2}x^2',
      answer: '3x',
      answer_alternatives: ['3*x'],
    })
    fouteAntwoorden.push({
      id: 'w1',
      question_id: 'q1',
      wrong_answer: '3x',
      error_explanation: 'Je hebt de macht vergeten.',
      category: 'macht vergeten',
      seen_count: 7,
    })

    const result = await checkWrongAnswerNew(db, 'q1', '3 x')

    expect(result).toEqual({
      errorExplanation: '',
      category: null,
      fromCache: true,
      isMathematicallyCorrect: true,
      generatedSteps: [],
    })
    expect(rij.answer_alternatives).toEqual(['3*x'])
    expect(fouteAntwoorden[0].seen_count).toBe(7)
    verwachtGeenGemini()
  })

  it('haalt een bekend fout antwoord uit de cache en telt het erbij', async () => {
    // f(x) = 2x^3 heeft afgeleide 6x^2. 2x is de afgeleide van x^2, niet van 2x^3.
    zetVraag({ answer_alternatives: ['6*x^2'] })
    fouteAntwoorden.push(
      {
        id: 'w1',
        question_id: 'q1',
        wrong_answer: '2x',
        error_explanation: 'Je hebt de macht laten staan. De afgeleide is 6x^2.',
        category: 'macht vergeten',
        seen_count: 4,
      },
      {
        id: 'w2',
        question_id: 'q1',
        wrong_answer: 'x^2',
        error_explanation: 'De constante factor ontbreekt.',
        category: 'factor vergeten',
        seen_count: 1,
      },
    )

    const result = await checkWrongAnswerNew(db, 'q1', '2 * x')

    expect(result).toEqual({
      errorExplanation: 'Je hebt de macht laten staan. De afgeleide is 6x^2.',
      category: 'macht vergeten',
      fromCache: true,
      isMathematicallyCorrect: false,
      generatedSteps: [],
    })
    expect(fouteAntwoorden[0].seen_count).toBe(5)
    expect(fouteAntwoorden[1].seen_count).toBe(1)
    verwachtGeenGemini()
  })

  it('voegt een wiskundig goed antwoord toe aan de alternatieven', async () => {
    // f(x) = x^{-1} heeft afgeleide -x^{-2}, en dat is hetzelfde als -1/x^2.
    const rij = zetVraag({
      latex_body: 'f(x) = x^{-1}',
      answer: '-x^-2',
      answer_alternatives: [],
    })

    const eerste = await checkWrongAnswerNew(db, 'q1', '-1/x^2')

    expect(eerste).toEqual({
      errorExplanation: '',
      category: null,
      fromCache: false,
      isMathematicallyCorrect: true,
      generatedSteps: [],
    })
    expect(rij.answer_alternatives).toEqual(['-1/x^2'])
    expect(fouteAntwoorden).toEqual([])

    const tweede = await checkWrongAnswerNew(db, 'q1', '-1/x^2')

    expect(tweede).toEqual({
      errorExplanation: '',
      category: null,
      fromCache: true,
      isMathematicallyCorrect: true,
      generatedSteps: [],
    })
    expect(rij.answer_alternatives).toEqual(['-1/x^2'])
    verwachtGeenGemini()
  })

  it('slaat de uitleg op als het antwoord fout is', async () => {
    // f(x) = 2x^3 heeft afgeleide 6x^2. 2x is dat niet.
    const rij = zetVraag()
    const uitleg = 'Je antwoord is niet correct. Kijk je tussenstappen eens goed na.'

    const eerste = await checkWrongAnswerNew(db, 'q1', '2x')

    expect(eerste).toEqual({
      errorExplanation: uitleg,
      category: null,
      fromCache: false,
      isMathematicallyCorrect: false,
      generatedSteps: [],
    })
    expect(rij.answer_alternatives).toEqual([])
    expect(stappen).toEqual([])
    expect(fouteAntwoorden).toHaveLength(1)
    expect(fouteAntwoorden[0]).toMatchObject({
      question_id: 'q1',
      wrong_answer: '2x',
      error_explanation: uitleg,
      category: null,
    })

    const naEerste = fouteAntwoorden[0].seen_count
    const tweede = await checkWrongAnswerNew(db, 'q1', '2x')

    expect(tweede).toEqual({
      errorExplanation: uitleg,
      category: null,
      fromCache: true,
      isMathematicallyCorrect: false,
      generatedSteps: [],
    })
    expect(fouteAntwoorden).toHaveLength(1)
    expect(fouteAntwoorden[0].seen_count).toBe(naEerste + 1)
    verwachtGeenGemini()
  })

  it('zegt dat de vraag niet gevonden is', async () => {
    const result = await checkWrongAnswerNew(db, 'bestaat-niet', '6x^2')

    expect(result).toEqual({ error: 'Vraag niet gevonden.' })
    expect(vragen).toEqual([])
    expect(fouteAntwoorden).toEqual([])
    verwachtGeenGemini()
  })
})

// =====================================================================
// Hetzelfde, maar nu met de neppe controle uit. De nepdatabase blijft, en
// in plaats van Gemini staat er per test een vast antwoord klaar. Zo komen
// ook het foutpad van Gemini en het wegschrijven van het stappenplan aan
// de beurt.
// =====================================================================

describe('checkWrongAnswerNew met een antwoord van Gemini', () => {
  beforeEach(() => {
    schoneStart()
    // Niet 'stub': dan loopt de code langs generateJson, en dat is de mock.
    vi.stubEnv('AI_CHECK_MODE', 'echt')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('geeft de fout van Gemini terug en schrijft niets weg', async () => {
    const rij = zetVraag()
    gemini.generateJson.mockResolvedValueOnce({
      ok: false,
      error: 'Gemini antwoordde niet.',
    })

    const result = await checkWrongAnswerNew(db, 'q1', '2x')

    expect(result).toEqual({ error: 'Gemini antwoordde niet.' })
    expect(gemini.generateJson).toHaveBeenCalledTimes(1)
    expect(fouteAntwoorden).toEqual([])
    expect(stappen).toEqual([])
    expect(rij.answer_alternatives).toEqual([])
  })

  it('schrijft het stappenplan genummerd weg en slaat lege stappen over', async () => {
    // f(x) = 2x^3 heeft afgeleide 6x^2; 2x is fout.
    zetVraag()
    gemini.generateJson.mockResolvedValueOnce({
      ok: true,
      raw: '{}',
      data: {
        is_mathematically_correct: false,
        category: 'macht vergeten',
        error_explanation: 'Je hebt de macht laten staan.',
        solution_steps: [
          '  Haal de factor $2$ naar voren.  ',
          '   ',
          'Machtsregel: $x^3$ wordt $3x^2$.',
          'Vermenigvuldig: $2 \\cdot 3x^2 = 6x^2$.',
        ],
      },
    })

    const result = await checkWrongAnswerNew(db, 'q1', '2x')

    const verwachteStappen = [
      { step_order: 1, step_description: 'Haal de factor $2$ naar voren.' },
      { step_order: 2, step_description: 'Machtsregel: $x^3$ wordt $3x^2$.' },
      { step_order: 3, step_description: 'Vermenigvuldig: $2 \\cdot 3x^2 = 6x^2$.' },
    ]

    expect(result).toEqual({
      errorExplanation: 'Je hebt de macht laten staan.',
      category: 'macht vergeten',
      fromCache: false,
      isMathematicallyCorrect: false,
      generatedSteps: verwachteStappen,
    })
    expect(stappen).toHaveLength(3)
    for (const [i, verwacht] of verwachteStappen.entries()) {
      expect(stappen[i]).toMatchObject({ question_id: 'q1', ...verwacht })
    }
    expect(fouteAntwoorden).toHaveLength(1)
    expect(fouteAntwoorden[0]).toMatchObject({
      question_id: 'q1',
      wrong_answer: '2x',
      error_explanation: 'Je hebt de macht laten staan.',
      category: 'macht vergeten',
    })
  })

  it('schrijft geen tweede stappenplan als er al een is', async () => {
    zetVraag()
    stappen.push({
      id: 's1',
      question_id: 'q1',
      step_order: 1,
      step_description: 'Dit stappenplan stond er al.',
    })
    gemini.generateJson.mockResolvedValueOnce({
      ok: true,
      raw: '{}',
      data: {
        is_mathematically_correct: false,
        category: 'macht vergeten',
        error_explanation: 'Je hebt de macht laten staan.',
        solution_steps: ['Deze stap hoort niet opgeslagen te worden.'],
      },
    })

    const result = await checkWrongAnswerNew(db, 'q1', '2x')

    expect(result).toMatchObject({ generatedSteps: [] })
    expect(stappen).toHaveLength(1)
    expect(stappen[0]).toMatchObject({ step_description: 'Dit stappenplan stond er al.' })

    // De prompt vraagt in dat geval om een leeg stappenplan.
    expect(gemini.generateJson.mock.calls[0][0]).toContain(
      'Er is al een stappenplan voor deze vraag',
    )
  })

  it('slaat geen stappenplan op als het antwoord wiskundig goed is', async () => {
    const rij = zetVraag({ answer: '-x^-2', latex_body: 'f(x) = x^{-1}' })
    gemini.generateJson.mockResolvedValueOnce({
      ok: true,
      raw: '{}',
      data: {
        is_mathematically_correct: true,
        category: '',
        error_explanation: '',
        solution_steps: ['Deze stap hoort niet opgeslagen te worden.'],
      },
    })

    const result = await checkWrongAnswerNew(db, 'q1', '-1/x^2')

    expect(result).toEqual({
      errorExplanation: '',
      category: null,
      fromCache: false,
      isMathematicallyCorrect: true,
      generatedSteps: [],
    })
    expect(rij.answer_alternatives).toEqual(['-1/x^2'])
    expect(stappen).toEqual([])
    expect(fouteAntwoorden).toEqual([])
  })
})
