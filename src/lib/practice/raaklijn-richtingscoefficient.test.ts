import { describe, expect, it } from 'vitest'

import { answersMatch } from './engine'

/**
 * De acht opgaven uit migratie 0089 (raaklijn met gegeven
 * richtingscoëfficiënt). Elke functie, de gevraagde richtingscoëfficiënt
 * (rc), het punt x0 waar f'(x0) = rc, en de opgeslagen raaklijn staan hier
 * los van de migratie nog eens genoteerd.
 *
 * We controleren numeriek (centraal differentiequotiënt) dat de helling
 * van f in x0 ook echt rc is, en dat de opgeslagen lijn m*x + b (met
 * m = rc) gelijk is aan de raaklijn f(x0) + rc * (x - x0) op een paar
 * x-samples.
 */

type Opgave = {
  nr: number
  antwoord: string
  f: (x: number) => number
  x0: number
  rc: number
  b: number
}

const opgaven: Opgave[] = [
  { nr: 1, antwoord: '6x - 9', f: (x) => x ** 2, x0: 3, rc: 6, b: -9 },
  { nr: 2, antwoord: '2x - 9', f: (x) => x ** 2 - 4 * x, x0: 3, rc: 2, b: -9 },
  { nr: 3, antwoord: '-2x + 4', f: (x) => -(x ** 2) + 2 * x, x0: 2, rc: -2, b: 4 },
  { nr: 4, antwoord: '5x - 8', f: (x) => 2 * x ** 2 - 3 * x, x0: 2, rc: 5, b: -8 },
  { nr: 5, antwoord: '-3x - 10', f: (x) => x ** 2 + x - 6, x0: -2, rc: -3, b: -10 },
  { nr: 6, antwoord: '10x - 12', f: (x) => 3 * x ** 2 - 2 * x, x0: 2, rc: 10, b: -12 },
  { nr: 7, antwoord: 'x + 2', f: (x) => -2 * x ** 2 + 5 * x, x0: 1, rc: 1, b: 2 },
  { nr: 8, antwoord: '-8x + 1', f: (x) => x ** 2 - 6 * x + 2, x0: -1, rc: -8, b: 1 },
]

const X_SAMPLES = [-3, -1.5, -0.5, 0, 0.5, 1, 2.5, 4]

/** Centrale differentiequotiënt, veel nauwkeuriger dan een eenzijdig quotiënt. */
function numeriekeAfgeleide(f: (x: number) => number, x: number): number {
  const h = 1e-5
  return (f(x + h) - f(x - h)) / (2 * h)
}

describe.each(opgaven)('raaklijn_richtingscoefficient vraag $nr', (o) => {
  it('f heeft in x0 echt de gevraagde richtingscoëfficiënt', () => {
    expect(numeriekeAfgeleide(o.f, o.x0)).toBeCloseTo(o.rc, 3)
  })

  it('de opgeslagen raaklijn (m = rc, b uit de tabel) klopt met f(x0) + rc * (x - x0)', () => {
    const raaklijn = (x: number) => o.rc * x + o.b
    for (const x of X_SAMPLES) {
      const verwacht = o.f(o.x0) + o.rc * (x - o.x0)
      expect(raaklijn(x)).toBeCloseTo(verwacht, 6)
    }
  })

  it('b in de raaklijn is echt f(x0) - rc * x0', () => {
    expect(o.b).toBeCloseTo(o.f(o.x0) - o.rc * o.x0, 6)
  })
})

describe('raaklijn_richtingscoefficient: nakijken van verschillende schrijfwijzen', () => {
  it.each(opgaven)('vraag $nr: het exacte antwoord wordt goedgerekend', (o) => {
    expect(answersMatch(o.antwoord, o.antwoord, [])).toBe(true)
  })

  it('andere volgorde van dezelfde lineaire formule is ook goed', () => {
    expect(answersMatch('-9 + 6x', '6x - 9', [])).toBe(true)
    expect(answersMatch('-9 + 2x', '2x - 9', [])).toBe(true)
    expect(answersMatch('4 - 2x', '-2x + 4', [])).toBe(true)
    expect(answersMatch('-8 + 5x', '5x - 8', [])).toBe(true)
    expect(answersMatch('-10 - 3x', '-3x - 10', [])).toBe(true)
    expect(answersMatch('-12 + 10x', '10x - 12', [])).toBe(true)
    expect(answersMatch('2 + x', 'x + 2', [])).toBe(true)
    expect(answersMatch('1 - 8x', '-8x + 1', [])).toBe(true)
  })

  it('een echt andere lijn is fout', () => {
    expect(answersMatch('6x - 8', '6x - 9', [])).toBe(false)
    expect(answersMatch('-2x - 9', '2x - 9', [])).toBe(false)
    expect(answersMatch('x - 2', 'x + 2', [])).toBe(false)
  })
})
