import { describe, expect, it } from 'vitest'

import { answersMatch } from './engine'

/**
 * De acht opgaven uit migratie 0088 (vergelijking van de raaklijn).
 * Elke functie f, zijn x0 en de raaklijn y = m*x + b staan hier los van de
 * migratie nog eens genoteerd. Dit is geen symbolische aantoning (dat staat
 * uitgeschreven in de stappen in de migratie); hier controleren we
 * numeriek, op een paar x-waarden, dat de opgeslagen rechte lijn ook echt de
 * raaklijn is: y(x) moet gelijk zijn aan f(x0) + f'(x0) * (x - x0).
 */

type Opgave = {
  nr: number
  antwoord: string
  x0: number
  f: (x: number) => number
  fAfgeleide: (x: number) => number
  lijn: (x: number) => number
}

const opgaven: Opgave[] = [
  {
    nr: 1,
    antwoord: '4x - 4',
    x0: 2,
    f: (x) => x ** 2,
    fAfgeleide: (x) => 2 * x,
    lijn: (x) => 4 * x - 4,
  },
  {
    nr: 2,
    antwoord: '-x - 1',
    x0: 1,
    f: (x) => x ** 2 - 3 * x,
    fAfgeleide: (x) => 2 * x - 3,
    lijn: (x) => -x - 1,
  },
  {
    nr: 3,
    antwoord: '1',
    x0: 0,
    f: (x) => 2 * x ** 2 + 1,
    fAfgeleide: (x) => 4 * x,
    lijn: () => 1,
  },
  {
    nr: 4,
    antwoord: '3x - 2',
    x0: 1,
    f: (x) => x ** 3,
    fAfgeleide: (x) => 3 * x ** 2,
    lijn: (x) => 3 * x - 2,
  },
  {
    nr: 5,
    antwoord: '-4',
    x0: -1,
    f: (x) => x ** 2 + 2 * x - 3,
    fAfgeleide: (x) => 2 * x + 2,
    lijn: () => -4,
  },
  {
    nr: 6,
    antwoord: '-2x + 9',
    x0: 3,
    f: (x) => -(x ** 2) + 4 * x,
    fAfgeleide: (x) => -2 * x + 4,
    lijn: (x) => -2 * x + 9,
  },
  {
    nr: 7,
    antwoord: '9x - 16',
    x0: 2,
    f: (x) => x ** 3 - 3 * x,
    fAfgeleide: (x) => 3 * x ** 2 - 3,
    lijn: (x) => 9 * x - 16,
  },
  {
    nr: 8,
    antwoord: '8x + 5',
    x0: -1,
    f: (x) => 2 * x ** 3 - x ** 2,
    fAfgeleide: (x) => 6 * x ** 2 - 2 * x,
    lijn: (x) => 8 * x + 5,
  },
]

const X_WAARDEN = [-3, -1.5, -0.5, 0, 0.5, 1, 2.5, 4]

/** Centrale differentiequotiënt, veel nauwkeuriger dan een eenzijdig quotiënt. */
function numeriekeAfgeleide(f: (x: number) => number, x: number): number {
  const h = 1e-5
  return (f(x + h) - f(x - h)) / (2 * h)
}

describe.each(opgaven)('raaklijn_vergelijking vraag $nr', (o) => {
  it('de opgeslagen afgeleide klopt numeriek met f', () => {
    for (const x of X_WAARDEN) {
      expect(numeriekeAfgeleide(o.f, x)).toBeCloseTo(o.fAfgeleide(x), 3)
    }
  })

  it('de opgeslagen raaklijn klopt met f(x0) + f\'(x0) * (x - x0) op een paar x-waarden', () => {
    for (const x of X_WAARDEN) {
      const verwacht = o.f(o.x0) + o.fAfgeleide(o.x0) * (x - o.x0)
      expect(o.lijn(x)).toBeCloseTo(verwacht, 6)
    }
  })

  it('de raaklijn raakt de grafiek ook echt in x0 (zelfde waarde en helling)', () => {
    expect(o.lijn(o.x0)).toBeCloseTo(o.f(o.x0), 6)
    const h = 1e-5
    const hellingLijn = (o.lijn(o.x0 + h) - o.lijn(o.x0 - h)) / (2 * h)
    expect(hellingLijn).toBeCloseTo(o.fAfgeleide(o.x0), 3)
  })
})

describe('raaklijn_vergelijking: nakijken van verschillende schrijfwijzen', () => {
  it.each(opgaven)('vraag $nr: het exacte antwoord wordt goedgerekend', (o) => {
    expect(answersMatch(o.antwoord, o.antwoord, [])).toBe(true)
  })

  it('andere volgorde van dezelfde rechte lijn is ook goed', () => {
    expect(answersMatch('-4 + 4x', '4x - 4', [])).toBe(true)
    expect(answersMatch('-1 - x', '-x - 1', [])).toBe(true)
    expect(answersMatch('-2 + 3x', '3x - 2', [])).toBe(true)
    expect(answersMatch('9 - 2x', '-2x + 9', [])).toBe(true)
    expect(answersMatch('5 + 8x', '8x + 5', [])).toBe(true)
  })

  it('een echt andere lijn is fout', () => {
    expect(answersMatch('4x - 4', '-x - 1', [])).toBe(false)
    expect(answersMatch('3x - 2', '9x - 16', [])).toBe(false)
    expect(answersMatch('-4', '1', [])).toBe(false)
  })
})
