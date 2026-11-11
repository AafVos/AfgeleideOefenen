import { describe, expect, it } from 'vitest'

import { answersMatch } from './engine'

/**
 * De acht opgaven uit migratie 0090 (raaklijnproblemen met een parameter,
 * paragraaf 6.4 blok C). Elke opgave bepaalt voor welke waarde(n) van a de
 * lijn de grafiek van f_a/g_a/h_a raakt: f_a(x) = lijn heeft dan precies één
 * oplossing voor x, dus is de discriminant van die kwadratische vergelijking
 * (in x) nul.
 *
 * Deze test rekent dat zelf na: voor elke opgave staan de coëfficiënten
 * A, B, C van f_a(x) - lijn = 0 (als kwadratische vergelijking in x), met de
 * a-waarde(n) uit de migratie ingevuld. De discriminant B^2 - 4AC moet dan 0
 * zijn (een dubbele wortel).
 */

/** B^2 - 4AC van een kwadratische vergelijking Ax^2 + Bx + C = 0. */
function discriminant(A: number, B: number, C: number): number {
  return B ** 2 - 4 * A * C
}

type Opgave = {
  nr: number
  antwoord: string
  /** A, B, C van f_a(x) - lijn = 0, voor elke a-waarde uit het antwoord. */
  coeffsVoorA: (a: number) => [number, number, number]
  aWaarden: number[]
}

const opgaven: Opgave[] = [
  // 1: f_a(x) = x^2 + a, lijn y = 2x -> x^2 - 2x + a = 0
  {
    nr: 1,
    antwoord: '1',
    coeffsVoorA: (a) => [1, -2, a],
    aWaarden: [1],
  },
  // 2: g_a(x) = x^2 - 6x + a, lijn y = -2x + 1 -> x^2 - 4x + (a - 1) = 0
  {
    nr: 2,
    antwoord: '5',
    coeffsVoorA: (a) => [1, -4, a - 1],
    aWaarden: [5],
  },
  // 3: h_a(x) = 2x^2 + a, lijn y = 4x - 2 -> 2x^2 - 4x + (a + 2) = 0
  {
    nr: 3,
    antwoord: '0',
    coeffsVoorA: (a) => [2, -4, a + 2],
    aWaarden: [0],
  },
  // 4: f_a(x) = x^2 + 4x + a, lijn y = 2x + 3 -> x^2 + 2x + (a - 3) = 0
  {
    nr: 4,
    antwoord: '4',
    coeffsVoorA: (a) => [1, 2, a - 3],
    aWaarden: [4],
  },
  // 5: g_a(x) = -x^2 + 6x + a, lijn y = 2x - 4 -> -x^2 + 4x + (a + 4) = 0
  {
    nr: 5,
    antwoord: '-8',
    coeffsVoorA: (a) => [-1, 4, a + 4],
    aWaarden: [-8],
  },
  // 6: h_a(x) = 3x^2 + a, lijn y = 12x - 9 -> 3x^2 - 12x + (a + 9) = 0
  {
    nr: 6,
    antwoord: '3',
    coeffsVoorA: (a) => [3, -12, a + 9],
    aWaarden: [3],
  },
  // 7: f_a(x) = x^2 + ax, lijn y = 2x - 1 -> x^2 + (a - 2)x + 1 = 0
  {
    nr: 7,
    antwoord: 'a = 0 of a = 4',
    coeffsVoorA: (a) => [1, a - 2, 1],
    aWaarden: [0, 4],
  },
  // 8: g_a(x) = x^2 + 2ax, lijn y = 6x - 9 -> x^2 + (2a - 6)x + 9 = 0
  {
    nr: 8,
    antwoord: 'a = 0 of a = 6',
    coeffsVoorA: (a) => [1, (2 * a) - 6, 9],
    aWaarden: [0, 6],
  },
]

describe.each(opgaven)('raaklijn_parameter vraag $nr', (o) => {
  it.each(o.aWaarden)('a = %i geeft een dubbele wortel (discriminant 0)', (a) => {
    const [A, B, C] = o.coeffsVoorA(a)
    expect(discriminant(A, B, C)).toBeCloseTo(0)
  })
})

describe('raaklijn_parameter: nakijken van verschillende schrijfwijzen', () => {
  it.each(opgaven)('vraag $nr: het exacte antwoord wordt goedgerekend', (o) => {
    expect(answersMatch(o.antwoord, o.antwoord, [])).toBe(true)
  })

  it('vraag 7: de omgedraaide volgorde wordt met answer_alternatives goedgerekend', () => {
    // Belangrijk: answersMatch vergelijkt tekst (na normalisatie van
    // spaties/hoofdletters), maar herkent "a = 0 of a = 4" en
    // "a = 4 of a = 0" niet als dezelfde zin - normalizeAnswer/zelfdeLijn/
    // zelfdeVeelterm werken op één formule, niet op "of"-zinnen met twee
    // waarden. Daarom staat de omgedraaide volgorde letterlijk in
    // answer_alternatives (migratie 0090), en die lijst wordt wel
    // doorzocht op een exacte (genormaliseerde) match.
    expect(answersMatch('a = 0 of a = 4', 'a = 0 of a = 4', ['a = 4 of a = 0'])).toBe(true)
    expect(
      answersMatch('a = 4 of a = 0', 'a = 0 of a = 4', ['a = 4 of a = 0']),
    ).toBe(true)
  })

  it('vraag 8: de omgedraaide volgorde wordt met answer_alternatives goedgerekend', () => {
    expect(answersMatch('a = 0 of a = 6', 'a = 0 of a = 6', ['a = 6 of a = 0'])).toBe(true)
    expect(
      answersMatch('a = 6 of a = 0', 'a = 0 of a = 6', ['a = 6 of a = 0']),
    ).toBe(true)
  })

  it('een echt andere a-waarde is fout', () => {
    expect(answersMatch('2', '1', [])).toBe(false)
    expect(answersMatch('a = 1 of a = 4', 'a = 0 of a = 4', ['a = 4 of a = 0'])).toBe(false)
  })
})
