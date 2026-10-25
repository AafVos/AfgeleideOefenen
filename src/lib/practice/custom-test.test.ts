import type { SupabaseClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  loadConfigData,
  loadTestResults,
  loadTestSessionState,
  pickQuestionsForTest,
} from '@/lib/practice/custom-test'
import type { Database } from '@/lib/supabase/types'

// =====================================================================
// De zelf-toets: welke vragen krijgt een leerling, en welk cijfer komt
// eruit?
//
// Alles draait op een nepdatabase in het geheugen. Geen Supabase, geen
// netwerk. De nepdatabase kent alleen wat custom-test.ts gebruikt:
// select, eq, in, order, maybeSingle en de join op user_sessions_new.
// =====================================================================

const leerling = 'leerling-1'
const andereLeerling = 'leerling-2'

type Rij = Record<string, unknown>

let tabellen: Record<string, Rij[]>

function leeg() {
  tabellen = {
    chapters: [],
    topics_new: [],
    paragraphs: [],
    theory_blocks: [],
    topic_clusters_new: [],
    questions_new: [],
    user_sessions_new: [],
    session_answers_new: [],
    custom_test_questions: [],
  }
}

function maakClient() {
  function from(tabel: string) {
    let rijen = [...(tabellen[tabel] ?? [])]

    const keten = {
      select: () => keten,
      eq(kolom: string, waarde: unknown) {
        if (kolom.includes('.')) {
          // De join uit AFG-118: session_answers_new!inner(user_sessions_new)
          // filtert op de eigenaar van de sessie. De koppeling loopt altijd
          // via session_id.
          const [jointabel, joinkolom] = kolom.split('.')
          const ids = new Set(
            (tabellen[jointabel!] ?? [])
              .filter((r) => r[joinkolom!] === waarde)
              .map((r) => r.id),
          )
          rijen = rijen.filter((r) => ids.has(r.session_id))
        } else {
          rijen = rijen.filter((r) => r[kolom] === waarde)
        }
        return keten
      },
      in(kolom: string, waarden: unknown[]) {
        rijen = rijen.filter((r) => waarden.includes(r[kolom]))
        return keten
      },
      order(kolom: string) {
        rijen = [...rijen].sort((a, b) => Number(a[kolom]) - Number(b[kolom]))
        return keten
      },
      returns: () => keten,
      maybeSingle: () => Promise.resolve({ data: rijen[0] ?? null, error: null }),
      then(
        onFulfilled?: (waarde: { data: Rij[]; error: null }) => unknown,
        onRejected?: (reden: unknown) => unknown,
      ) {
        return Promise.resolve({ data: rijen, error: null }).then(onFulfilled, onRejected)
      },
    }

    return keten
  }

  return { from } as unknown as SupabaseClient<Database>
}

/** Zet één sessie van de testleerling klaar. */
function sessie(id: string, extra: Rij = {}) {
  tabellen.user_sessions_new.push({
    id,
    user_id: leerling,
    session_type: 'custom_test',
    ended_at: null,
    show_answers: 'immediate',
    ...extra,
  })
}

/** De vragen van een toets, in de volgorde waarin de leerling ze krijgt. */
function toetsvragen(sessionId: string, questionIds: string[]) {
  questionIds.forEach((question_id, order_index) => {
    tabellen.custom_test_questions.push({ session_id: sessionId, question_id, order_index })
  })
}

function antwoord(sessionId: string, questionId: string, isCorrect: boolean | null, tekst = '') {
  tabellen.session_answers_new.push({
    session_id: sessionId,
    question_id: questionId,
    user_answer: tekst,
    is_correct: isCorrect,
  })
}

/**
 * Eén hoofdstuk met één onderwerp en twee clusters:
 * c1 "Kettingregel" (q1, q2) en c2 "Productregel" (q3, q4).
 * c1 hangt aan theorieblok b1, c2 heeft er geen en valt terug op b2 van
 * het onderwerp.
 */
function boekje() {
  tabellen.chapters.push({ id: 'h1', slug: 'hoofdstuk-1', title: 'Differentiëren', order_index: 0 })
  tabellen.topics_new.push({
    id: 't1',
    slug: 'kettingregel-en-productregel',
    title: 'Regels',
    chapter_id: 'h1',
    order_index: 0,
    theory_block_id: 'b2',
  })
  tabellen.theory_blocks.push(
    { id: 'b1', paragraph_id: 'p1', slug: 'blok-a', letter: 'A', title: 'A', order_index: 0 },
    { id: 'b2', paragraph_id: 'p1', slug: 'blok-b', letter: 'B', title: 'B', order_index: 1 },
  )
  tabellen.paragraphs.push({
    id: 'p1',
    chapter_id: 'h1',
    slug: 'paragraaf-1',
    label: '1.1',
    title: 'Regels',
    order_index: 0,
    zichtbaar: true,
  })
  tabellen.topic_clusters_new.push(
    {
      id: 'c1',
      slug: 'kettingregel',
      title: 'Kettingregel',
      topic_id: 't1',
      order_index: 0,
      theory_block_id: 'b1',
    },
    {
      id: 'c2',
      slug: 'productregel',
      title: 'Productregel',
      topic_id: 't1',
      order_index: 1,
      theory_block_id: null,
    },
  )
  tabellen.questions_new.push(
    { id: 'q1', cluster_id: 'c1', latex_body: 'f(x)=(2x+1)^3', answer: '6(2x+1)^2', latex_answer: '6(2x+1)^2' },
    { id: 'q2', cluster_id: 'c1', latex_body: 'f(x)=(x^2+1)^2', answer: '4x(x^2+1)', latex_answer: '4x(x^2+1)' },
    { id: 'q3', cluster_id: 'c2', latex_body: 'f(x)=x\\cdot e^x', answer: '(x+1)e^x', latex_answer: '(x+1)e^x' },
    { id: 'q4', cluster_id: 'c2', latex_body: 'f(x)=x^2\\sin x', answer: '2x\\sin x+x^2\\cos x', latex_answer: null },
  )
}

beforeEach(() => {
  leeg()
})

// ---------------------------------------------------------------------
// De uitslag: hoeveel heeft de leerling er goed, en per cluster?
// ---------------------------------------------------------------------

const AFGEROND = '2026-10-17T10:00:00Z'

/** Een toets die de leerling helemaal gemaakt heeft en die is afgesloten. */
function afgerondeSessie(id: string, extra: Rij = {}) {
  sessie(id, { ended_at: AFGEROND, ...extra })
}

/** De uitslag van een afgeronde toets. Faalt als er geen uitslag is. */
async function uitslagVan(sessionId: string) {
  const antwoord = await loadTestResults(maakClient(), leerling, sessionId)
  if (antwoord.status !== 'ready') {
    throw new Error(`Verwachtte een uitslag, maar kreeg "${antwoord.status}".`)
  }
  return antwoord.results
}

describe('loadTestResults', () => {
  it('telt per cluster hoeveel vragen er goed zijn', async () => {
    boekje()
    afgerondeSessie('s1')
    toetsvragen('s1', ['q1', 'q2', 'q3', 'q4'])
    antwoord('s1', 'q1', true, '6(2x+1)^2')
    antwoord('s1', 'q2', false, '3(2x+1)^2')
    antwoord('s1', 'q3', true, '(x+1)e^x')
    antwoord('s1', 'q4', false, '2x\\cos x')

    const uitslag = await uitslagVan('s1')

    expect(uitslag.totalCount).toBe(4)
    expect(uitslag.correctCount).toBe(2)
    expect(uitslag.perCluster.map((c) => [c.clusterId, c.total, c.correct])).toEqual([
      ['c1', 2, 1],
      ['c2', 2, 1],
    ])
  })

  it('rekent een niet beantwoorde vraag fout en laat het antwoord leeg', async () => {
    boekje()
    afgerondeSessie('s1')
    toetsvragen('s1', ['q1', 'q2'])
    antwoord('s1', 'q1', true, '6(2x+1)^2')
    // q2 is nooit ingeleverd: de leerling stopte halverwege.

    const uitslag = await uitslagVan('s1')

    expect(uitslag.totalCount).toBe(2)
    expect(uitslag.correctCount).toBe(1)
    const q2 = uitslag.perCluster[0]!.items[1]!
    expect(q2.questionId).toBe('q2')
    expect(q2.isCorrect).toBe(false)
    expect(q2.userAnswer).toBeNull()
  })

  it('rekent een opgevraagde uitwerking (is_correct leeg) fout', async () => {
    boekje()
    afgerondeSessie('s1')
    toetsvragen('s1', ['q1'])
    antwoord('s1', 'q1', null)

    const uitslag = await uitslagVan('s1')

    expect(uitslag.totalCount).toBe(1)
    expect(uitslag.correctCount).toBe(0)
    expect(uitslag.perCluster[0]!.items[0]!.isCorrect).toBe(false)
  })

  it('houdt een cluster waar niets van beantwoord is gewoon in de uitslag', async () => {
    boekje()
    afgerondeSessie('s1')
    toetsvragen('s1', ['q1', 'q3', 'q4'])
    antwoord('s1', 'q1', true, '6(2x+1)^2')
    // Van c2 (q3 en q4) is niets beantwoord.

    const uitslag = await uitslagVan('s1')

    expect(uitslag.totalCount).toBe(3)
    expect(uitslag.correctCount).toBe(1)
    const c2 = uitslag.perCluster.find((c) => c.clusterId === 'c2')!
    expect(c2.total).toBe(2)
    expect(c2.correct).toBe(0)
    expect(c2.items.every((i) => !i.isCorrect)).toBe(true)
  })

  it('zet de opgaven in de volgorde van de toets en vult de namen in', async () => {
    boekje()
    afgerondeSessie('s1')
    toetsvragen('s1', ['q3', 'q1', 'q4'])

    const uitslag = await uitslagVan('s1')

    // Volgorde van de clusters: die van de eerste vraag erover.
    expect(uitslag.perCluster.map((c) => c.clusterId)).toEqual(['c2', 'c1'])
    const c2 = uitslag.perCluster[0]!
    expect(c2.items.map((i) => i.questionId)).toEqual(['q3', 'q4'])
    expect(c2.clusterTitle).toBe('Productregel')
    expect(c2.topicTitle).toBe('Regels')
    expect(c2.chapterSlug).toBe('hoofdstuk-1')
    expect(c2.clusterSlug).toBe('productregel')
    // c2 heeft zelf geen theorieblok: dat van het onderwerp wordt gebruikt.
    expect(c2.blockSlug).toBe('blok-b')
    expect(uitslag.perCluster[1]!.blockSlug).toBe('blok-a')
    expect(c2.items[0]!.correctAnswer).toBe('(x+1)e^x')
    expect(c2.items[1]!.latexAnswer).toBeNull()
  })

  it('slaat een vraag over die niet meer bestaat', async () => {
    boekje()
    afgerondeSessie('s1')
    toetsvragen('s1', ['q1', 'weg'])
    antwoord('s1', 'q1', true, '6(2x+1)^2')

    const uitslag = await uitslagVan('s1')

    expect(uitslag.totalCount).toBe(1)
    expect(uitslag.correctCount).toBe(1)
    expect(uitslag.perCluster[0]!.items).toHaveLength(1)
  })

  it('geeft een lege uitslag als de toets geen vragen heeft', async () => {
    boekje()
    sessie('s1')

    const uitslag = await uitslagVan('s1')

    expect(uitslag).toEqual({ totalCount: 0, correctCount: 0, perCluster: [] })
  })

  // De resultaat-URL is te raden: /zelf-toets/resultaat/<id> naast
  // /zelf-toets/loop/<id>. Typt een leerling hem halverwege in, dan mag hij
  // de juiste antwoorden van zijn volgende vragen niet te zien krijgen.
  it('geeft geen uitslag zolang de leerling nog bezig is', async () => {
    boekje()
    sessie('s1', { show_answers: 'end' })
    toetsvragen('s1', ['q1', 'q2', 'q3'])
    antwoord('s1', 'q1', true, '6(2x+1)^2')

    const antwoordVanDeServer = await loadTestResults(maakClient(), leerling, 's1')

    expect(antwoordVanDeServer).toEqual({
      status: 'running',
      answeredCount: 1,
      totalCount: 3,
    })
  })

  it('geeft geen uitslag van een toets waar nog niets van gemaakt is', async () => {
    boekje()
    sessie('s1')
    toetsvragen('s1', ['q1'])

    const antwoordVanDeServer = await loadTestResults(maakClient(), leerling, 's1')

    expect(antwoordVanDeServer.status).toBe('running')
  })

  it('geeft de uitslag wel als alles beantwoord is maar het afsluiten misging', async () => {
    boekje()
    sessie('s1')
    toetsvragen('s1', ['q1', 'q2'])
    antwoord('s1', 'q1', true, '6(2x+1)^2')
    antwoord('s1', 'q2', false, '3(2x+1)^2')

    const uitslag = await uitslagVan('s1')

    expect(uitslag.totalCount).toBe(2)
    expect(uitslag.correctCount).toBe(1)
  })

  it('geeft niets terug voor een toets van iemand anders', async () => {
    boekje()
    afgerondeSessie('s1', { user_id: andereLeerling })
    toetsvragen('s1', ['q1'])
    antwoord('s1', 'q1', true, '6(2x+1)^2')

    expect(await loadTestResults(maakClient(), leerling, 's1')).toEqual({
      status: 'not-found',
    })
  })

  it('geeft niets terug voor een gewone oefensessie of een onbekende sessie', async () => {
    boekje()
    sessie('s1', { session_type: 'practice' })

    expect((await loadTestResults(maakClient(), leerling, 's1')).status).toBe('not-found')
    expect((await loadTestResults(maakClient(), leerling, 'bestaat-niet')).status).toBe(
      'not-found',
    )
  })

  it('vult streepjes in als het cluster niet meer bestaat', async () => {
    boekje()
    tabellen.questions_new.push({
      id: 'q9',
      cluster_id: 'weg',
      latex_body: null,
      answer: '2x',
      latex_answer: null,
    })
    afgerondeSessie('s1')
    toetsvragen('s1', ['q9'])

    const uitslag = await uitslagVan('s1')

    const groep = uitslag.perCluster[0]!
    expect(groep.clusterTitle).toBe('—')
    expect(groep.topicTitle).toBe('—')
    expect(groep.chapterSlug).toBe('')
    expect(groep.blockSlug).toBe('')
  })
})

// ---------------------------------------------------------------------
// Welke vragen komen er in de toets?
// ---------------------------------------------------------------------

describe('pickQuestionsForTest', () => {
  it('geeft niets terug zonder clusters of zonder aantal', async () => {
    boekje()

    expect(await pickQuestionsForTest(maakClient(), leerling, [], 'all', 5)).toEqual([])
    expect(await pickQuestionsForTest(maakClient(), leerling, ['c1'], 'all', 0)).toEqual([])
    expect(await pickQuestionsForTest(maakClient(), leerling, ['c1'], 'all', -1)).toEqual([])
  })

  it('geeft niets terug als er in die clusters geen opgaven staan', async () => {
    boekje()

    expect(await pickQuestionsForTest(maakClient(), leerling, ['leeg'], 'all', 5)).toEqual([])
  })

  it('kiest bij "alles" uit alle opgaven van de gekozen clusters', async () => {
    boekje()

    const gekozen = await pickQuestionsForTest(maakClient(), leerling, ['c1', 'c2'], 'all', 3)

    expect(gekozen).toHaveLength(3)
    expect(new Set(gekozen).size).toBe(3)
    expect(gekozen.every((id) => ['q1', 'q2', 'q3', 'q4'].includes(id))).toBe(true)
  })

  it('kiest alleen uit de gevraagde clusters', async () => {
    boekje()

    const gekozen = await pickQuestionsForTest(maakClient(), leerling, ['c2'], 'all', 10)

    expect([...gekozen].sort()).toEqual(['q3', 'q4'])
  })

  it('geeft er minder terug dan gevraagd als er niet meer zijn', async () => {
    boekje()

    const gekozen = await pickQuestionsForTest(maakClient(), leerling, ['c1'], 'all', 10)

    expect(gekozen).toHaveLength(2)
  })

  it('laat bij "nieuw" alles weg wat de leerling al gemaakt heeft', async () => {
    boekje()
    sessie('s1')
    antwoord('s1', 'q1', true)
    antwoord('s1', 'q2', false)

    const gekozen = await pickQuestionsForTest(maakClient(), leerling, ['c1', 'c2'], 'new', 10)

    expect([...gekozen].sort()).toEqual(['q3', 'q4'])
  })

  it('houdt een opgevraagde uitwerking bij "nieuw" nieuw (AFG-102)', async () => {
    boekje()
    sessie('s1')
    antwoord('s1', 'q1', null)

    const gekozen = await pickQuestionsForTest(maakClient(), leerling, ['c1'], 'new', 10)

    expect([...gekozen].sort()).toEqual(['q1', 'q2'])
  })

  it('geeft bij "fout" alleen de opgaven die fout gingen', async () => {
    boekje()
    sessie('s1')
    antwoord('s1', 'q1', true)
    antwoord('s1', 'q2', false)
    antwoord('s1', 'q3', null)

    const gekozen = await pickQuestionsForTest(maakClient(), leerling, ['c1', 'c2'], 'wrong', 10)

    expect(gekozen).toEqual(['q2'])
  })

  it('kijkt niet naar de antwoorden van een andere leerling', async () => {
    boekje()
    sessie('s2', { user_id: andereLeerling })
    antwoord('s2', 'q1', false)
    antwoord('s2', 'q2', true)

    expect(await pickQuestionsForTest(maakClient(), leerling, ['c1'], 'wrong', 10)).toEqual([])
    const nieuw = await pickQuestionsForTest(maakClient(), leerling, ['c1'], 'new', 10)
    expect([...nieuw].sort()).toEqual(['q1', 'q2'])
  })

  it('husselt de opgaven zonder er een te verliezen of te verdubbelen', async () => {
    boekje()
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)

    const gekozen = await pickQuestionsForTest(maakClient(), leerling, ['c1', 'c2'], 'all', 4)

    expect([...gekozen].sort()).toEqual(['q1', 'q2', 'q3', 'q4'])
    expect(random).toHaveBeenCalled()
    random.mockRestore()
  })
})

// ---------------------------------------------------------------------
// Waar is de leerling in zijn toets?
// ---------------------------------------------------------------------

describe('loadTestSessionState', () => {
  it('wijst de eerste nog niet beantwoorde vraag aan', async () => {
    boekje()
    sessie('s1')
    toetsvragen('s1', ['q1', 'q2', 'q3'])
    antwoord('s1', 'q1', true)

    const stand = await loadTestSessionState(maakClient(), leerling, 's1')

    expect(stand).toEqual({
      sessionId: 's1',
      totalCount: 3,
      answeredCount: 1,
      ended: false,
      showAnswers: 'immediate',
      nextQuestionId: 'q2',
      nextOrdinal: 2,
    })
  })

  it('heeft geen volgende vraag meer als alles beantwoord is', async () => {
    boekje()
    sessie('s1', { ended_at: '2026-10-17T10:00:00Z', show_answers: 'end' })
    toetsvragen('s1', ['q1', 'q2'])
    antwoord('s1', 'q1', true)
    antwoord('s1', 'q2', false)

    const stand = await loadTestSessionState(maakClient(), leerling, 's1')

    expect(stand!.answeredCount).toBe(2)
    expect(stand!.ended).toBe(true)
    expect(stand!.showAnswers).toBe('end')
    expect(stand!.nextQuestionId).toBeNull()
    expect(stand!.nextOrdinal).toBeNull()
  })

  it('telt een antwoord op een vraag die niet in de toets zit niet mee', async () => {
    boekje()
    sessie('s1')
    toetsvragen('s1', ['q1'])
    antwoord('s1', 'q1', true)
    antwoord('s1', 'q4', true)

    const stand = await loadTestSessionState(maakClient(), leerling, 's1')

    expect(stand!.totalCount).toBe(1)
    expect(stand!.answeredCount).toBe(1)
  })

  it('valt terug op meteen nakijken als dat niet is opgeslagen', async () => {
    boekje()
    sessie('s1', { show_answers: null })
    toetsvragen('s1', ['q1'])

    const stand = await loadTestSessionState(maakClient(), leerling, 's1')

    expect(stand!.showAnswers).toBe('immediate')
  })

  it('geeft niets terug voor een sessie van iemand anders of van een ander soort', async () => {
    boekje()
    sessie('s1', { user_id: andereLeerling })
    sessie('s2', { session_type: 'practice' })

    expect(await loadTestSessionState(maakClient(), leerling, 's1')).toBeNull()
    expect(await loadTestSessionState(maakClient(), leerling, 's2')).toBeNull()
    expect(await loadTestSessionState(maakClient(), leerling, 'bestaat-niet')).toBeNull()
  })
})

// ---------------------------------------------------------------------
// Het keuzescherm: hoeveel nieuwe en hoeveel foute per cluster?
// ---------------------------------------------------------------------

describe('loadConfigData', () => {
  it('telt per cluster de opgaven, de nieuwe en de foute', async () => {
    boekje()
    sessie('s1')
    antwoord('s1', 'q1', true)
    antwoord('s1', 'q2', false)
    antwoord('s1', 'q3', null)

    const config = await loadConfigData(maakClient(), leerling)

    expect(config.clusters.map((c) => [c.id, c.questionCount, c.newCount, c.wrongCount])).toEqual([
      // q1 goed, q2 fout: niets nieuws meer, één fout.
      ['c1', 2, 0, 1],
      // q3 is alleen een opgevraagde uitwerking, dus blijft nieuw.
      ['c2', 2, 2, 0],
    ])
  })

  it('telt de antwoorden van een andere leerling niet mee', async () => {
    boekje()
    sessie('s2', { user_id: andereLeerling })
    antwoord('s2', 'q1', false)

    const config = await loadConfigData(maakClient(), leerling)

    expect(config.clusters[0]!.newCount).toBe(2)
    expect(config.clusters[0]!.wrongCount).toBe(0)
  })

  it('houdt alleen de theorieblokken van zichtbare paragrafen over', async () => {
    boekje()
    tabellen.theory_blocks.push({
      id: 'b3',
      paragraph_id: 'p-verborgen',
      slug: 'blok-c',
      letter: 'C',
      title: 'C',
      order_index: 2,
    })
    tabellen.paragraphs.push({
      id: 'p-verborgen',
      chapter_id: 'h1',
      slug: 'paragraaf-2',
      label: '1.2',
      title: 'Verborgen',
      order_index: 1,
      zichtbaar: false,
    })

    const config = await loadConfigData(maakClient(), leerling)

    expect(config.paragraphs.map((p) => p.id)).toEqual(['p1'])
    expect(config.blocks.map((b) => b.id)).toEqual(['b1', 'b2'])
  })
})
