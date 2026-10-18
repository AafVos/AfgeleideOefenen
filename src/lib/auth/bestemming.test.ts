import type { SupabaseClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Database } from '@/lib/supabase/types'

import {
  bestemmingNaBevestigen,
  bestemmingNaInloggen,
  linkNaarEersteSom,
  padMetEersteVraag,
} from './bestemming'

// =====================================================================
// Waar een leerling terechtkomt na het bevestigen van zijn mail en na
// het inloggen.
//
// Een nepdatabase in het geheugen, geen Supabase. Het gaat hier om de
// vertakkingen: geen oefenpad, een oefenpad naar een onderwerp dat niet
// meer bestaat, een soort som zonder opgaven, en een site waar nog
// helemaal niets klaarstaat.
// =====================================================================

type Rij = Record<string, unknown>
type Resultaat = { data: unknown; error: null }

const HOOFDSTUKKEN: Rij[] = [
  { id: 'ch1', slug: 'basisregels', title: 'Basisregels', order_index: 1 },
  { id: 'ch2', slug: 'kettingregel', title: 'Kettingregel', order_index: 2 },
]

const ONDERWERPEN: Rij[] = [
  // Een onderwerp zonder soorten sommen: daar valt niets te oefenen, dus
  // de startknop hoort eroverheen te stappen.
  { id: 't0', slug: 'nog-leeg', title: 'Nog leeg', chapter_id: 'ch1', order_index: 1 },
  { id: 't1', slug: 'machten', title: 'Machten', chapter_id: 'ch1', order_index: 2 },
  { id: 't2', slug: 'ketting', title: 'Kettingregel', chapter_id: 'ch2', order_index: 1 },
  // Hoort bij een hoofdstuk dat niet (meer) bestaat.
  { id: 't9', slug: 'zwevend', title: 'Zwevend', chapter_id: 'ch-weg', order_index: 1 },
]

const SOORTEN: Rij[] = [
  // De eerste soort som van 'machten' heeft geen opgaven; de tweede wel.
  { id: 'c0', slug: 'machten-leeg', title: 'Machten, leeg', topic_id: 't1', order_index: 1 },
  { id: 'c1', slug: 'machten-basis', title: 'Machten, basis', topic_id: 't1', order_index: 2 },
  { id: 'c2', slug: 'ketting-basis', title: 'Ketting, basis', topic_id: 't2', order_index: 1 },
  { id: 'c9', slug: 'zwevend-basis', title: 'Zwevend, basis', topic_id: 't9', order_index: 1 },
]

const OPGAVEN: Rij[] = [
  { id: 'q-moeilijk', cluster_id: 'c1', difficulty: 3, order_index: 1 },
  { id: 'q-makkelijk', cluster_id: 'c1', difficulty: 1, order_index: 2 },
  { id: 'q-ketting', cluster_id: 'c2', difficulty: 1, order_index: 1 },
  { id: 'q-zwevend', cluster_id: 'c9', difficulty: 1, order_index: 1 },
]

/** Wat er op dit moment in de nepdatabase staat. */
let tabellen: Record<string, Rij[]>

/** Welke tabellen er tijdens een test gelezen zijn. */
let gelezen: string[]

beforeEach(() => {
  tabellen = {
    chapters: HOOFDSTUKKEN,
    topics_new: ONDERWERPEN,
    topic_clusters_new: SOORTEN,
    questions_new: OPGAVEN,
  }
  gelezen = []
})

/** Minimale nabootsing van de query-builder van Supabase. */
function from(tabel: string) {
  const eqs: Record<string, unknown> = {}
  let eerste = false
  gelezen.push(tabel)

  function run(enkel: boolean): Resultaat {
    const rijen = (tabellen[tabel] ?? [])
      .filter((rij) => Object.entries(eqs).every(([kolom, waarde]) => rij[kolom] === waarde))
      .sort((a, b) =>
        tabel === 'questions_new' && a.difficulty !== b.difficulty
          ? Number(a.difficulty) - Number(b.difficulty)
          : Number(a.order_index) - Number(b.order_index),
      )
    const gekozen = eerste ? rijen.slice(0, 1) : rijen
    return { data: enkel ? (gekozen[0] ?? null) : gekozen, error: null }
  }

  const builder = {
    select: () => builder,
    eq: (kolom: string, waarde: unknown) => {
      eqs[kolom] = waarde
      return builder
    },
    order: () => builder,
    limit: () => {
      eerste = true
      return builder
    },
    maybeSingle: async () => run(true),
    then: (resolve: (value: Resultaat) => unknown) => Promise.resolve(run(false)).then(resolve),
  }

  return builder
}

const db = { from } as unknown as SupabaseClient<Database>

describe('linkNaarEersteSom', () => {
  it('wijst naar de makkelijkste opgave van de eerste soort som met opgaven', async () => {
    // Hoofdstuk 1, onderwerp 'machten' (want 'nog-leeg' heeft geen
    // soorten sommen), en daarvan de eerste soort: 'machten-leeg'.
    // Die is leeg, dus er komt geen link uit.
    tabellen.topic_clusters_new = SOORTEN.filter((soort) => soort.id !== 'c0')

    expect(await linkNaarEersteSom(db)).toBe(
      '/oefenen?chapter=basisregels&topic=machten&cluster=machten-basis&q=q-makkelijk',
    )
  })

  it('geeft null als de eerste soort som nog geen opgaven heeft', async () => {
    expect(await linkNaarEersteSom(db)).toBeNull()
  })

  it('geeft null op een site zonder enige opgave', async () => {
    tabellen = { chapters: [], topics_new: [], topic_clusters_new: [], questions_new: [] }

    expect(await linkNaarEersteSom(db)).toBeNull()
  })
})

describe('padMetEersteVraag', () => {
  it('zoekt de eerste opgave bij een pad met alleen een onderwerp', async () => {
    expect(await padMetEersteVraag(db, '/oefenen?chapter=ch2&topic=ketting')).toBe(
      '/oefenen?chapter=kettingregel&topic=ketting&cluster=ketting-basis&q=q-ketting',
    )
  })

  it('slaat een soort som zonder opgaven over', async () => {
    expect(await padMetEersteVraag(db, '/oefenen?topic=machten')).toBe(
      '/oefenen?chapter=basisregels&topic=machten&cluster=machten-basis&q=q-makkelijk',
    )
  })

  it('laat een pad dat al een opgave noemt met rust', async () => {
    const pad = '/oefenen?chapter=basisregels&topic=machten&cluster=machten-basis&q=q-makkelijk'

    expect(await padMetEersteVraag(db, pad)).toBe(pad)
    expect(gelezen).toEqual([])
  })

  it('laat een pad zonder onderwerp met rust', async () => {
    expect(await padMetEersteVraag(db, '/oefenen?chapter=basisregels')).toBe(
      '/oefenen?chapter=basisregels',
    )
    expect(gelezen).toEqual([])
  })

  it('valt terug op het pad zelf als het onderwerp niet meer bestaat', async () => {
    expect(await padMetEersteVraag(db, '/oefenen?topic=verdwenen')).toBe(
      '/oefenen?topic=verdwenen',
    )
  })

  it('valt terug op het pad zelf als het hoofdstuk niet meer bestaat', async () => {
    expect(await padMetEersteVraag(db, '/oefenen?topic=zwevend')).toBe('/oefenen?topic=zwevend')
  })

  it('valt terug op het pad zelf als de genoemde soort som niet bestaat', async () => {
    expect(await padMetEersteVraag(db, '/oefenen?topic=machten&cluster=verdwenen')).toBe(
      '/oefenen?topic=machten&cluster=verdwenen',
    )
  })

  it('valt terug op het pad zelf als geen enkele soort som opgaven heeft', async () => {
    tabellen.questions_new = []

    expect(await padMetEersteVraag(db, '/oefenen?topic=machten')).toBe('/oefenen?topic=machten')
  })

  it('houdt zich aan de genoemde soort som en pakt niet zomaar een andere', async () => {
    expect(await padMetEersteVraag(db, '/oefenen?topic=machten&cluster=machten-leeg')).toBe(
      '/oefenen?topic=machten&cluster=machten-leeg',
    )
  })
})

describe('bestemmingNaBevestigen', () => {
  it('stuurt een leerling zonder gekozen soort naar de eerste opgave', async () => {
    tabellen.topic_clusters_new = SOORTEN.filter((soort) => soort.id !== 'c0')

    expect(await bestemmingNaBevestigen(db, null)).toBe(
      '/nl/oefenen?chapter=basisregels&topic=machten&cluster=machten-basis&q=q-makkelijk',
    )
  })

  it('stuurt naar het dashboard als er nergens een opgave klaarstaat', async () => {
    tabellen.questions_new = []

    expect(await bestemmingNaBevestigen(db, null)).toBe('/nl/dashboard')
  })

  it('volgt het gekozen oefenpad en opent meteen de eerste som', async () => {
    expect(await bestemmingNaBevestigen(db, '/oefenen?topic=ketting')).toBe(
      '/nl/oefenen?chapter=kettingregel&topic=ketting&cluster=ketting-basis&q=q-ketting',
    )
  })

  it('negeert een pad dat niet van deze site is', async () => {
    tabellen.questions_new = []

    expect(await bestemmingNaBevestigen(db, 'https://ergens-anders.nl/oefenen')).toBe(
      '/nl/dashboard',
    )
  })
})

describe('bestemmingNaInloggen', () => {
  it('stuurt een leerling zonder gekozen soort naar het dashboard', async () => {
    expect(await bestemmingNaInloggen(db, null, 'nl')).toBe('/nl/dashboard')
    expect(gelezen).toEqual([])
  })

  it('volgt het gekozen oefenpad en opent meteen de eerste som', async () => {
    expect(await bestemmingNaInloggen(db, '/oefenen?topic=ketting', 'nl')).toBe(
      '/nl/oefenen?chapter=kettingregel&topic=ketting&cluster=ketting-basis&q=q-ketting',
    )
  })

  it('houdt het menu van de gekozen soort aan als daar niets klaarstaat', async () => {
    tabellen.questions_new = []

    expect(await bestemmingNaInloggen(db, '/oefenen?topic=ketting', 'nl')).toBe(
      '/nl/oefenen?topic=ketting',
    )
  })

  it('zet de taalcode er maar één keer voor', async () => {
    expect(await bestemmingNaInloggen(db, '/nl/oefenen?chapter=basisregels', 'nl')).toBe(
      '/nl/oefenen?chapter=basisregels',
    )
  })

  it('negeert een pad buiten het oefenen', async () => {
    expect(await bestemmingNaInloggen(db, '/admin', 'nl')).toBe('/nl/dashboard')
  })
})
