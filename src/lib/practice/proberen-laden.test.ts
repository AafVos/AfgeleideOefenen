import { beforeEach, describe, expect, it, vi } from 'vitest'

// =====================================================================
// Een proef laden, en het antwoord van één som opvragen.
//
// Het belangrijkste hier: het antwoord mag alleen terugkomen voor een som
// die ook echt in deze proef zit. Anders zou iemand met een ander
// questionId het antwoord van een willekeurige opgave kunnen ophalen.
//
// Een nepdatabase in het geheugen, geen Supabase.
// =====================================================================

type QueryResult = { data: unknown; error: null }

const HOOFDSTUKKEN = [{ id: 'ch1', slug: 'test-hoofdstuk', title: 'Testhoofdstuk' }]

const ONDERWERPEN = [
  { id: 't1', chapter_id: 'ch1', slug: 'machten', title: 'Machten' },
  { id: 't2', chapter_id: 'ch1', slug: 'kettingregel', title: 'Kettingregel' },
]

const BLOKKEN = [
  { id: 'c1', topic_id: 't1', slug: 'machten-basis', title: 'Machten, basis' },
  { id: 'c2', topic_id: 't2', slug: 'ketting-basis', title: 'Kettingregel, basis' },
]

// q1 t/m q3 zijn de drie makkelijkste van blok c1: dat is de proef.
// q4 zit in hetzelfde blok maar valt erbuiten, q9 hoort bij een ander
// onderwerp.
const VRAGEN = [
  vraag('q1', 'c1', 1, 1, 'x^2', '2x', ['x \\cdot 2']),
  vraag('q2', 'c1', 1, 2, 'x^3', '3x^2', []),
  vraag('q3', 'c1', 1, 3, 'x^4', '4x^3', []),
  vraag('q4', 'c1', 2, 4, 'x^5', '5x^4', []),
  vraag('q9', 'c2', 1, 1, '(2x+1)^3', '6(2x+1)^2', []),
]

function vraag(
  id: string,
  cluster_id: string,
  difficulty: number,
  order_index: number,
  formule: string,
  answer: string,
  answer_alternatives: string[],
) {
  return {
    id,
    cluster_id,
    difficulty,
    order_index,
    latex_body: `f(x)=${formule}`,
    answer_prefix: "f'(x)=",
    answer,
    latex_answer: answer,
    answer_alternatives,
  }
}

const STAPPEN = [
  { id: 's1', question_id: 'q1', step_order: 1, step_description: 'Haal de macht naar voren.' },
  { id: 's2', question_id: 'q1', step_order: 2, step_description: 'Verlaag de macht met 1.' },
  { id: 's9', question_id: 'q9', step_order: 1, step_description: 'Begin met de buitenste functie.' },
]

/** Hoe vaak het antwoord van een som uit de database is gelezen. */
let antwoordLezingen: string[]

/** Minimale nabootsing van de query-builder van Supabase. */
function from(table: string) {
  const eqs: Record<string, string> = {}
  const ins: Record<string, string[]> = {}

  function run(): QueryResult {
    if (table === 'chapters') {
      const rij = HOOFDSTUKKEN.find((h) => h.slug === eqs.slug)
      return { data: rij ? { id: rij.id, title: rij.title } : null, error: null }
    }

    if (table === 'topics_new') {
      const rijen = ONDERWERPEN.filter(
        (o) => o.chapter_id === eqs.chapter_id && (!eqs.slug || o.slug === eqs.slug),
      )
      return { data: rijen.map((o) => ({ id: o.id, title: o.title })), error: null }
    }

    if (table === 'topic_clusters_new') {
      const rijen = BLOKKEN.filter(
        (b) =>
          (ins.topic_id ?? []).includes(b.topic_id) && (!eqs.slug || b.slug === eqs.slug),
      )
      return { data: rijen.map((b) => ({ id: b.id, title: b.title })), error: null }
    }

    if (table === 'questions_new') {
      // De proef zelf: alle sommen van de gekozen blokken, zonder antwoord.
      if (ins.cluster_id) {
        const rijen = VRAGEN.filter((v) => ins.cluster_id.includes(v.cluster_id))
        return {
          data: rijen.map((v) => ({
            id: v.id,
            latex_body: v.latex_body,
            answer_prefix: v.answer_prefix,
            difficulty: v.difficulty,
            order_index: v.order_index,
          })),
          error: null,
        }
      }
      // Het antwoord van één som. Dit mag alleen gebeuren ná de controle.
      antwoordLezingen.push(eqs.id)
      const vraag = VRAGEN.find((v) => v.id === eqs.id)
      return {
        data: vraag
          ? {
              answer: vraag.answer,
              latex_answer: vraag.latex_answer,
              answer_alternatives: vraag.answer_alternatives,
            }
          : null,
        error: null,
      }
    }

    if (table === 'question_steps_new') {
      const rijen = STAPPEN.filter((s) => s.question_id === eqs.question_id).sort(
        (a, b) => a.step_order - b.step_order,
      )
      return {
        data: rijen.map((s) => ({
          id: s.id,
          step_order: s.step_order,
          step_description: s.step_description,
        })),
        error: null,
      }
    }

    return { data: null, error: null }
  }

  const builder = {
    select: () => builder,
    eq: (kolom: string, waarde: string) => {
      eqs[kolom] = waarde
      return builder
    },
    in: (kolom: string, waarden: string[]) => {
      ins[kolom] = waarden
      return builder
    },
    order: () => builder,
    maybeSingle: async () => run(),
    then: (resolve: (value: QueryResult) => unknown) => Promise.resolve(run()).then(resolve),
  }

  return builder
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ from }),
}))

const { laadNakijkRij, laadProef } = await import('./proberen-laden')

/** De proef van blok c1: q1, q2 en q3. */
const BLOK_SELECTIE = {
  chapter: 'test-hoofdstuk',
  topic: 'machten',
  cluster: 'machten-basis',
}

beforeEach(() => {
  antwoordLezingen = []
})

describe('laadProef', () => {
  it('geeft drie sommen zonder het antwoord mee te sturen', async () => {
    const pakket = await laadProef(BLOK_SELECTIE)

    expect(pakket?.titel).toBe('Machten, basis')
    expect(pakket?.opgaven.map((o) => o.id)).toEqual(['q1', 'q2', 'q3'])
    expect(JSON.stringify(pakket)).not.toContain('3x^2')
    expect(antwoordLezingen).toEqual([])
  })

  it('geeft niets terug bij een hoofdstuk dat niet bestaat', async () => {
    const pakket = await laadProef({ chapter: 'bestaat-niet', topic: null, cluster: null })

    expect(pakket).toBeNull()
  })
})

describe('laadNakijkRij', () => {
  it('geeft antwoord en stappen van een som die in de proef zit', async () => {
    const rij = await laadNakijkRij(BLOK_SELECTIE, 'q1')

    expect(rij).toEqual({
      answer: '2x',
      latex_answer: '2x',
      answer_alternatives: ['x \\cdot 2'],
      stappen: [
        { id: 's1', step_order: 1, step_description: 'Haal de macht naar voren.' },
        { id: 's2', step_order: 2, step_description: 'Verlaag de macht met 1.' },
      ],
    })
  })

  it('geeft niets terug voor een som uit hetzelfde blok die buiten de proef valt', async () => {
    // q4 bestaat en hoort bij blok c1, maar is niet een van de drie gekozen
    // sommen. Het antwoord mag dus niet weglekken.
    const rij = await laadNakijkRij(BLOK_SELECTIE, 'q4')

    expect(rij).toBeNull()
    expect(antwoordLezingen).toEqual([])
  })

  it('geeft niets terug voor een som uit een ander onderwerp', async () => {
    const rij = await laadNakijkRij(BLOK_SELECTIE, 'q9')

    expect(rij).toBeNull()
    expect(antwoordLezingen).toEqual([])
  })

  it('geeft niets terug bij een som die helemaal niet bestaat', async () => {
    const rij = await laadNakijkRij(BLOK_SELECTIE, 'bestaat-niet')

    expect(rij).toBeNull()
    expect(antwoordLezingen).toEqual([])
  })

  it('geeft niets terug als de proef zelf niet bestaat', async () => {
    const rij = await laadNakijkRij(
      { chapter: 'bestaat-niet', topic: null, cluster: null },
      'q1',
    )

    expect(rij).toBeNull()
    expect(antwoordLezingen).toEqual([])
  })

  it('laat een som uit een breder gekozen proef wél door', async () => {
    // Zonder blok: dan telt het hele onderwerp mee, maar nog steeds alleen de
    // drie gekozen sommen.
    const breed = { chapter: 'test-hoofdstuk', topic: 'machten', cluster: null }

    expect(await laadNakijkRij(breed, 'q2')).toMatchObject({ answer: '3x^2' })
    expect(await laadNakijkRij(breed, 'q4')).toBeNull()
  })
})
