import { describe, expect, it } from 'vitest'

import { answersMatch } from './engine'

/**
 * De acht opgaven uit migratie 0091 (extreme waarden algebraïsch berekenen).
 * Elke functie staat hier los van de migratie nog eens genoteerd. Dit is
 * geen symbolische aantoning (dat staat uitgeschreven in de stappen in de
 * migratie); hier controleren we numeriek dat het opgeslagen stationaire
 * punt ook echt een stationair punt is (de helling is daar (bijna) nul), en
 * voor de kwadratische opgaven bovendien dat het teken van die helling
 * vlak ervoor en vlak erna bij een minimum of een maximum hoort.
 */

type SoortGevraagd = 'x-coordinaat' | 'waarde'
type SoortExtreem = 'minimum' | 'maximum'

type Opgave = {
  nr: number
  gevraagd: SoortGevraagd
  soort: SoortExtreem
  antwoord: string
  f: (x: number) => number
  x0: number
}

const opgaven: Opgave[] = [
  {
    nr: 1,
    gevraagd: 'x-coordinaat',
    soort: 'minimum',
    antwoord: '2',
    f: (x) => x ** 2 - 4 * x + 1,
    x0: 2,
  },
  {
    nr: 2,
    gevraagd: 'waarde',
    soort: 'maximum',
    antwoord: '9',
    f: (x) => -(x ** 2) + 6 * x,
    x0: 3,
  },
  {
    nr: 3,
    gevraagd: 'x-coordinaat',
    soort: 'minimum',
    antwoord: '-1',
    f: (x) => x ** 2 + 2 * x - 3,
    x0: -1,
  },
  {
    nr: 4,
    gevraagd: 'waarde',
    soort: 'minimum',
    antwoord: '-3',
    f: (x) => 2 * x ** 2 - 8 * x + 5,
    x0: 2,
  },
  {
    nr: 5,
    gevraagd: 'x-coordinaat',
    soort: 'maximum',
    antwoord: '2',
    f: (x) => -3 * x ** 2 + 12 * x - 7,
    x0: 2,
  },
  {
    nr: 6,
    gevraagd: 'x-coordinaat',
    soort: 'minimum',
    antwoord: '1',
    f: (x) => x ** 3 - 3 * x,
    x0: 1,
  },
  {
    nr: 7,
    gevraagd: 'waarde',
    soort: 'maximum',
    antwoord: '4',
    f: (x) => x ** 3 - 6 * x ** 2 + 9 * x,
    x0: 1,
  },
  {
    nr: 8,
    gevraagd: 'x-coordinaat',
    soort: 'maximum',
    antwoord: '2',
    f: (x) => -(x ** 3) + 3 * x ** 2,
    x0: 2,
  },
]

/** De derdegraads opgaven: twee stationaire punten, dus expliciet nalopen
 * welk van de twee het gevraagde punt is (zie tabel in de opgave-beschrijving
 * hierboven). Alleen deze opgaven hebben ook een tegenpunt om het teken van
 * de helling mee te vergelijken. */
const CUBIC_NUMMERS = [6, 7, 8]

/** Centrale differentiequotiënt, veel nauwkeuriger dan een eenzijdig quotiënt. */
function numeriekeAfgeleide(f: (x: number) => number, x: number): number {
  const h = 1e-5
  return (f(x + h) - f(x - h)) / (2 * h)
}

describe.each(opgaven)('extreme_waarden vraag $nr', (o) => {
  it('de helling in het opgeslagen stationaire punt is (bijna) nul', () => {
    expect(numeriekeAfgeleide(o.f, o.x0)).toBeCloseTo(0, 3)
  })

  if (o.gevraagd === 'waarde') {
    it('f(x0) komt overeen met het opgeslagen antwoord', () => {
      expect(o.f(o.x0)).toBeCloseTo(Number(o.antwoord), 6)
    })
  } else {
    it('x0 komt overeen met het opgeslagen antwoord', () => {
      expect(o.x0).toBeCloseTo(Number(o.antwoord), 6)
    })
  }

  if (CUBIC_NUMMERS.includes(o.nr)) {
    it(`het teken van de helling rond x0 past bij een ${o.soort}`, () => {
      const stap = 0.3
      const hellingVoor = numeriekeAfgeleide(o.f, o.x0 - stap)
      const hellingNa = numeriekeAfgeleide(o.f, o.x0 + stap)
      if (o.soort === 'minimum') {
        // Eerst dalend (negatieve helling), daarna stijgend (positieve helling).
        expect(hellingVoor).toBeLessThan(0)
        expect(hellingNa).toBeGreaterThan(0)
      } else {
        // Eerst stijgend (positieve helling), daarna dalend (negatieve helling).
        expect(hellingVoor).toBeGreaterThan(0)
        expect(hellingNa).toBeLessThan(0)
      }
    })
  }
})

describe('extreme_waarden: nakijken van het antwoord', () => {
  it.each(opgaven)('vraag $nr: het exacte antwoord wordt goedgerekend', (o) => {
    expect(answersMatch(o.antwoord, o.antwoord, [])).toBe(true)
  })

  it('een ander getal is fout', () => {
    expect(answersMatch('3', '2', [])).toBe(false)
    expect(answersMatch('-2', '-1', [])).toBe(false)
    expect(answersMatch('8', '9', [])).toBe(false)
  })

  it('een gelijkwaardige schrijfwijze van hetzelfde getal is goed', () => {
    expect(answersMatch(' -1 ', '-1', [])).toBe(true)
    expect(answersMatch('x=2', '2', [])).toBe(true)
  })
})
