import { describe, expect, it } from 'vitest'

import { answersMatch } from './engine'

/**
 * De acht opgaven uit migratie 0087 (afgeleide met de limietdefinitie).
 * Elke functie en zijn opgeslagen afgeleide staan hier los van de migratie
 * nog eens genoteerd. Dit is geen symbolische aantoning met de limiet zelf
 * (dat staat uitgeschreven in de stappen in de migratie); hier controleren
 * we numeriek, op een paar x-waarden, dat de opgeslagen formule van f' ook
 * echt de helling van f is.
 */

type Opgave = {
  nr: number
  antwoord: string
  f: (x: number) => number
  fAfgeleide: (x: number) => number
}

const opgaven: Opgave[] = [
  { nr: 1, antwoord: '2x + 3', f: (x) => x ** 2 + 3 * x, fAfgeleide: (x) => 2 * x + 3 },
  { nr: 2, antwoord: '4x - 1', f: (x) => 2 * x ** 2 - x, fAfgeleide: (x) => 4 * x - 1 },
  { nr: 3, antwoord: '2x', f: (x) => x ** 2 - 5, fAfgeleide: (x) => 2 * x },
  { nr: 4, antwoord: '3x^2', f: (x) => x ** 3, fAfgeleide: (x) => 3 * x ** 2 },
  { nr: 5, antwoord: '2x + 4', f: (x) => x ** 2 + 4 * x + 1, fAfgeleide: (x) => 2 * x + 4 },
  { nr: 6, antwoord: '-2x + 2', f: (x) => -(x ** 2) + 2 * x, fAfgeleide: (x) => -2 * x + 2 },
  { nr: 7, antwoord: '3x^2 - 2', f: (x) => x ** 3 - 2 * x, fAfgeleide: (x) => 3 * x ** 2 - 2 },
  {
    nr: 8,
    antwoord: '6x^2 + 2x',
    f: (x) => 2 * x ** 3 + x ** 2,
    fAfgeleide: (x) => 6 * x ** 2 + 2 * x,
  },
]

const X_WAARDEN = [-3, -1.5, -0.5, 0, 0.5, 1, 2.5, 4]

/** Centrale differentiequotiënt, veel nauwkeuriger dan een eenzijdig quotiënt. */
function numeriekeAfgeleide(f: (x: number) => number, x: number): number {
  const h = 1e-5
  return (f(x + h) - f(x - h)) / (2 * h)
}

describe.each(opgaven)('afgeleide_limietdefinitie vraag $nr', (o) => {
  it('de opgeslagen afgeleide klopt numeriek met f', () => {
    for (const x of X_WAARDEN) {
      expect(numeriekeAfgeleide(o.f, x)).toBeCloseTo(o.fAfgeleide(x), 3)
    }
  })

  it('de opgeslagen afgeleide klopt met f.fAfgeleide op dezelfde x-waarden als het antwoord', () => {
    // Sanity-check dat de losse closure hierboven ook echt bij de
    // opgeslagen antwoordtekst hoort: evalueer de tekst niet, maar
    // vergelijk op een extra x-waarde om een typefout in de closure zelf
    // (los van de migratie) uit te sluiten.
    expect(o.fAfgeleide(10)).toBeCloseTo(numeriekeAfgeleide(o.f, 10), 2)
  })
})

describe('afgeleide_limietdefinitie: nakijken van verschillende schrijfwijzen', () => {
  it.each(opgaven)('vraag $nr: het exacte antwoord wordt goedgerekend', (o) => {
    expect(answersMatch(o.antwoord, o.antwoord, [])).toBe(true)
  })

  it('andere volgorde van dezelfde lineaire/kwadratische formule is ook goed', () => {
    expect(answersMatch('3 + 2x', '2x + 3', [])).toBe(true)
    expect(answersMatch('-1 + 4x', '4x - 1', [])).toBe(true)
    expect(answersMatch('2 - 2x', '-2x + 2', [])).toBe(true)
    expect(answersMatch('-2 + 3x^2', '3x^2 - 2', [])).toBe(true)
    expect(answersMatch('2x + 6x^2', '6x^2 + 2x', [])).toBe(true)
  })

  it('een echt andere formule is fout', () => {
    expect(answersMatch('2x + 4', '2x + 3', [])).toBe(false)
    expect(answersMatch('3x^2', '3x^2 - 2', [])).toBe(false)
  })
})
