import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { answersMatch } from './engine'
import { parseOefenstofMigratie } from './oefenstof-migraties'

/**
 * De acht opgaven uit migratie 0092 (nieuwe soort "Kettingregel met een
 * eenvoudige breuk", vóór "kettingregel + quotiëntregel" in h6_combinaties).
 * Elke functie en zijn opgeslagen afgeleide (het hoofdantwoord, al
 * samengevoegd) staan hier los van de migratie nog eens genoteerd, en worden
 * numeriek (centraal differentiequotiënt) tegen elkaar gehouden.
 */

type Opgave = {
  nr: number
  f: (x: number) => number
  fAfgeleide: (x: number) => number
  antwoord: string
  alternatief: string
}

const opgaven: Opgave[] = [
  {
    nr: 1,
    f: (x) => Math.sqrt(2 * x + 1) / x,
    fAfgeleide: (x) => (-x - 1) / (x ** 2 * Math.sqrt(2 * x + 1)),
    antwoord: '(-x - 1)/(x^2*sqrt(2x + 1))',
    alternatief: '(x/sqrt(2x + 1) - sqrt(2x + 1))/x^2',
  },
  {
    nr: 2,
    f: (x) => Math.sqrt(4 * x - 3) / x,
    fAfgeleide: (x) => (3 - 2 * x) / (x ** 2 * Math.sqrt(4 * x - 3)),
    antwoord: '(3 - 2x)/(x^2*sqrt(4x - 3))',
    alternatief: '(2x/sqrt(4x - 3) - sqrt(4x - 3))/x^2',
  },
  {
    nr: 3,
    f: (x) => (3 * x + 2) ** 2 / x,
    fAfgeleide: (x) => (9 * x ** 2 - 4) / x ** 2,
    antwoord: '(9x^2 - 4)/x^2',
    alternatief: '(6(3x + 2)*x - (3x + 2)^2)/x^2',
  },
  {
    nr: 4,
    f: (x) => Math.sqrt(2 * x + 5) / (x + 1),
    fAfgeleide: (x) => (-x - 4) / ((x + 1) ** 2 * Math.sqrt(2 * x + 5)),
    antwoord: '(-x - 4)/((x + 1)^2*sqrt(2x + 5))',
    alternatief: '((x + 1)/sqrt(2x + 5) - sqrt(2x + 5))/(x + 1)^2',
  },
  {
    nr: 5,
    f: (x) => (2 * x - 1) ** 2 / (x + 3),
    fAfgeleide: (x) => (4 * x ** 2 + 24 * x - 13) / (x + 3) ** 2,
    antwoord: '(4x^2 + 24x - 13)/(x + 3)^2',
    alternatief: '(4(2x - 1)*(x + 3) - (2x - 1)^2)/(x + 3)^2',
  },
  {
    nr: 6,
    f: (x) => Math.sqrt(5 * x - 4) / (x - 2),
    fAfgeleide: (x) => (-5 * x - 2) / (2 * (x - 2) ** 2 * Math.sqrt(5 * x - 4)),
    antwoord: '(-5x - 2)/(2(x - 2)^2*sqrt(5x - 4))',
    alternatief: '(5(x - 2)/(2*sqrt(5x - 4)) - sqrt(5x - 4))/(x - 2)^2',
  },
  {
    nr: 7,
    f: (x) => (3 * x + 1) ** 2 / (2 * x + 1),
    fAfgeleide: (x) => (18 * x ** 2 + 18 * x + 4) / (2 * x + 1) ** 2,
    antwoord: '(18x^2 + 18x + 4)/(2x + 1)^2',
    alternatief: '(6(3x + 1)*(2x + 1) - 2(3x + 1)^2)/(2x + 1)^2',
  },
  {
    nr: 8,
    f: (x) => Math.sqrt(3 * x + 4) / (2 * x - 3),
    fAfgeleide: (x) => (-6 * x - 25) / (2 * (2 * x - 3) ** 2 * Math.sqrt(3 * x + 4)),
    antwoord: '(-6x - 25)/(2(2x - 3)^2*sqrt(3x + 4))',
    alternatief: '(3(2x - 3)/(2*sqrt(3x + 4)) - 2*sqrt(3x + 4))/(2x - 3)^2',
  },
]

/** Veilige x-waarden per vraag: binnen het domein (wortel bestaat, noemer niet nul). */
const X_PER_VRAAG: Record<number, number[]> = {
  1: [0.2, 1, 3, 7],
  2: [1, 2, 5, 10],
  3: [0.5, 1, 4, 9],
  4: [0, 2, 5, 12],
  5: [-2, 0, 4, 8],
  6: [1, 3, 6, 10],
  7: [0, 1, 3, 7],
  8: [2, 3, 6, 10],
}

function numeriekeAfgeleide(f: (x: number) => number, x: number): number {
  const h = 1e-5
  return (f(x + h) - f(x - h)) / (2 * h)
}

describe.each(opgaven)('ketting_eenvoudige_breuk vraag $nr', (o) => {
  it('de opgeslagen (samengevoegde) afgeleide klopt numeriek met f', () => {
    for (const x of X_PER_VRAAG[o.nr]) {
      expect(numeriekeAfgeleide(o.f, x)).toBeCloseTo(o.fAfgeleide(x), 2)
    }
  })

  it('het hoofdantwoord wordt goedgerekend', () => {
    expect(answersMatch(o.antwoord, o.antwoord, [o.alternatief])).toBe(true)
  })

  it('het (nog niet samengevoegde) alternatief wordt ook goedgerekend', () => {
    expect(answersMatch(o.alternatief, o.antwoord, [o.alternatief])).toBe(true)
  })
})

/**
 * De naam van de vraagfunctie (bijv. $g$ in "g(x) = ...") mag niet ook de
 * naam zijn van de teller of de noemer in de stap die ze "Noem $g(x) = ...$
 * en $h(x) = ...$" introduceert — dat is twee verschillende functies met
 * dezelfde letter in één uitleg (dezelfde foutklasse als migratie 0075).
 * Deze test leest de migratie zelf, niet een kopie, zodat hij de echte fout
 * laat zien.
 */
describe('ketting_eenvoudige_breuk: vraagfunctie botst niet met teller/noemer', () => {
  const bestand = path.join(
    process.cwd(),
    'supabase/migrations/0092_oefenstof_h6_ketting_eenvoudige_breuk.sql',
  )
  const { vragen, stappen } = parseOefenstofMigratie(bestand)

  it.each(vragen)('vraag $orderIndex', (v) => {
    const vraagLetter = /^([fgh])\(x\)\s*=/.exec(v.latexBody)?.[1]
    expect(vraagLetter, `geen functienaam gevonden in "${v.latexBody}"`).toBeDefined()

    const introStap = stappen.find((s) => s.qOrder === v.orderIndex && s.stepOrder === 1)
    expect(introStap, `geen stap 1 (teller/noemer) voor vraag ${v.orderIndex}`).toBeDefined()

    const tellerNoemerLetters = [...(introStap?.stepDescription.matchAll(/\$([fgh])\(x\)/g) ?? [])].map(
      (m) => m[1],
    )
    expect(
      tellerNoemerLetters,
      `stap 1 van vraag ${v.orderIndex} noemt geen teller/noemer: "${introStap?.stepDescription}"`,
    ).toHaveLength(2)

    expect(
      tellerNoemerLetters,
      `vraagfunctie "${vraagLetter}" wordt ook gebruikt voor teller of noemer in vraag ${v.orderIndex}: "${introStap?.stepDescription}"`,
    ).not.toContain(vraagLetter)
  })
})
