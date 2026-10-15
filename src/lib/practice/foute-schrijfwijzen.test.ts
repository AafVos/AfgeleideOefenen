import { describe, expect, it } from 'vitest'

import { answersMatch } from './engine'

/**
 * De vormen die migratie 0066 uit de extra antwoorden haalt.
 * Zolang zo'n vorm in de lijst staat, keurt answersMatch hem altijd goed.
 * Zonder die lijst mag hij niet goed zijn, en het echte antwoord wel.
 * Elke afgeleide is hier opnieuw uitgerekend, op een paar x-waarden.
 */

const PUNTEN = [0.5, 2, 4]

function gelijk(a: (x: number) => number, b: (x: number) => number): boolean {
  return PUNTEN.every((x) => Math.abs(a(x) - b(x)) < 1e-9)
}

function ongelijk(a: (x: number) => number, b: (x: number) => number): boolean {
  return PUNTEN.some((x) => Math.abs(a(x) - b(x)) > 1e-6)
}

type Som = {
  naam: string
  antwoord: string
  weg: string[]
  blijven: string[]
  afgeleide: (x: number) => number
  opgeslagen: (x: number) => number
  fout: Array<(x: number) => number>
}

const sommen: Som[] = [
  {
    naam: '(3x^3-1)^2',
    antwoord: '2 \\cdot 9x^2(3x^3 - 1)',
    weg: ['54^(5)-18x^(2)'],
    blijven: ['54x^5-18x^2'],
    // 2 · 9x^2 · (3x^3 - 1) = 54x^5 - 18x^2
    afgeleide: (x) => 18 * x ** 2 * (3 * x ** 3 - 1),
    opgeslagen: (x) => 2 * 9 * x ** 2 * (3 * x ** 3 - 1),
    // 54^5 - 18x^2, niet 54x^5
    fout: [(x) => 54 ** 5 - 18 * x ** 2],
  },
  {
    naam: '5x^6-3x^5+2x-7',
    antwoord: '30x^5 - 15x^4 + 2',
    weg: ['30x  5  −15x  4  +2'],
    blijven: ['30x⁵-15x⁴+2'],
    afgeleide: (x) => 30 * x ** 5 - 15 * x ** 4 + 2,
    opgeslagen: (x) => 30 * x ** 5 - 15 * x ** 4 + 2,
    // macht is een spatie: 30·x·5 - 15·x·4 + 2 = 90x + 2
    fout: [(x) => 90 * x + 2],
  },
  {
    naam: '(1/2)x^3+2x^2(x-4)+6',
    antwoord: '7,5x^2 - 16x',
    weg: ['7(1)/(2)x^(2)-16x', '7,5x  2  −16x'],
    blijven: ['7.5x^2-16x', '7,5x²-16x'],
    // (1/2)x^3 + 2x^3 - 8x^2 + 6 → 7,5x^2 - 16x
    afgeleide: (x) => 7.5 * x ** 2 - 16 * x,
    opgeslagen: (x) => 7.5 * x ** 2 - 16 * x,
    // 7·(1/2)x^2 - 16x = 3,5x^2 - 16x; en 7,5·x·2 - 16x = -x
    fout: [(x) => 3.5 * x ** 2 - 16 * x, (x) => -x],
  },
  {
    naam: 'x^3·√x',
    antwoord: '3,5*x^2*sqrt(x)',
    weg: ['3(1)/(2)x^(2)sqrt(x)'],
    blijven: ['3,5x^(5/2)'],
    // x^(7/2) → (7/2) x^(5/2) = 3,5 x^2 √x
    afgeleide: (x) => 3.5 * x ** 2 * Math.sqrt(x),
    opgeslagen: (x) => 3.5 * x ** 2 * Math.sqrt(x),
    // 3·(1/2) = 1,5
    fout: [(x) => 1.5 * x ** 2 * Math.sqrt(x)],
  },
  {
    naam: 'x^2·√x',
    antwoord: '2,5*x*sqrt(x)',
    weg: ['2(1)/(2)xsqrt(x)'],
    blijven: ['2,5x^(3/2)'],
    // x^(5/2) → (5/2) x^(3/2) = 2,5 x √x
    afgeleide: (x) => 2.5 * x * Math.sqrt(x),
    opgeslagen: (x) => 2.5 * x * Math.sqrt(x),
    // 2·(1/2) = 1, dus x√x
    fout: [(x) => x * Math.sqrt(x)],
  },
  {
    naam: 'x·√x',
    antwoord: '1,5*sqrt(x)',
    weg: ['1(1)/(2)sqrt(x)'],
    blijven: ['1,5x^0,5'],
    // x^(3/2) → (3/2) √x
    afgeleide: (x) => 1.5 * Math.sqrt(x),
    opgeslagen: (x) => 1.5 * Math.sqrt(x),
    // 1·(1/2) = 0,5
    fout: [(x) => 0.5 * Math.sqrt(x)],
  },
  {
    naam: 'x^2(x√x-3)',
    antwoord: '3,5*x^2*sqrt(x) - 6x',
    weg: ['3(1)/(2)x^(2)sqrt(x)-6x'],
    blijven: ['x^2*1,5x^(0,5)+(x^(1,5)-3)*2x'],
    // x^(7/2) - 3x^2 → 3,5 x^2 √x - 6x
    afgeleide: (x) => 3.5 * x ** 2 * Math.sqrt(x) - 6 * x,
    opgeslagen: (x) => 3.5 * x ** 2 * Math.sqrt(x) - 6 * x,
    fout: [(x) => 1.5 * x ** 2 * Math.sqrt(x) - 6 * x],
  },
  {
    naam: 'sin(x)',
    antwoord: 'cos(x)',
    weg: ['coss(x)'],
    blijven: ['cosx'],
    afgeleide: (x) => Math.cos(x),
    opgeslagen: (x) => Math.cos(x),
    fout: [],
  },
  {
    naam: 'x^2 ln(x)',
    antwoord: '2x ln(x) + x',
    weg: ['2xlinx+x'],
    blijven: ['x+2xln(x)'],
    // 2x ln(x) + x^2 · (1/x)
    afgeleide: (x) => 2 * x * Math.log(x) + x,
    opgeslagen: (x) => 2 * x * Math.log(x) + x,
    fout: [],
  },
  {
    naam: '3^(2x-1)',
    antwoord: '2 \\cdot  3^(2x-1) ln(3)',
    weg: ['3^2x−1ln(3) keer 2'],
    blijven: ['2*3^(2x-1)*ln(3)'],
    afgeleide: (x) => 2 * 3 ** (2 * x - 1) * Math.log(3),
    opgeslagen: (x) => 2 * 3 ** (2 * x - 1) * Math.log(3),
    fout: [],
  },
  {
    naam: '(x-2)/(x+5)',
    antwoord: '7/(x + 5)^2',
    weg: ['(x+5)*1-(x-2)*1/(x+5)^2', '(x+5)-(x-2)/(x+5)²'],
    blijven: ['7/(x+5)²'],
    afgeleide: (x) => 7 / (x + 5) ** 2,
    opgeslagen: (x) => 7 / (x + 5) ** 2,
    // alleen het laatste stuk staat boven de streep
    fout: [
      (x) => x + 5 - (x - 2) / (x + 5) ** 2,
      (x) => x + 5 - (x - 2) / (x + 5) ** 2,
    ],
  },
  {
    naam: '(2x+1)/(3x-1)',
    antwoord: '-5/(3x - 1)^2',
    weg: ['(3x-1)*2-(2x+1)*3 / (3x-1)^2'],
    blijven: ['-5/(3x-1)²'],
    afgeleide: (x) => -5 / (3 * x - 1) ** 2,
    opgeslagen: (x) => -5 / (3 * x - 1) ** 2,
    fout: [(x) => 2 * (3 * x - 1) - (3 * (2 * x + 1)) / (3 * x - 1) ** 2],
  },
  {
    naam: '(3-4x)/(2x+5)',
    antwoord: '-26/(2x + 5)^2',
    weg: ['((2x+5)*-4)-((3-4x)*2)/(2x+5)^2'],
    blijven: ['(-4*(2x+5)-(3-4x)*2)/((2x+5)^2)'],
    afgeleide: (x) => -26 / (2 * x + 5) ** 2,
    opgeslagen: (x) => -26 / (2 * x + 5) ** 2,
    fout: [(x) => -4 * (2 * x + 5) - (2 * (3 - 4 * x)) / (2 * x + 5) ** 2],
  },
  {
    naam: '(2x-3)/(3x-1)',
    antwoord: '7/(3x - 1)^2',
    weg: ['(3x-1)*2-(2x-3)*3/(3x-1)^2'],
    blijven: ['(7)/((3x-1)^2)'],
    afgeleide: (x) => 7 / (3 * x - 1) ** 2,
    opgeslagen: (x) => 7 / (3 * x - 1) ** 2,
    fout: [(x) => 2 * (3 * x - 1) - (3 * (2 * x - 3)) / (3 * x - 1) ** 2],
  },
  {
    naam: '(5t+2)/(1-3t)',
    antwoord: '11/(1 - 3t)^2',
    weg: ['(1-3t)*5-(5t+2)*-3/(1-3t)^2'],
    blijven: ['11/(1-3t)²'],
    afgeleide: (t) => 11 / (1 - 3 * t) ** 2,
    opgeslagen: (t) => 11 / (1 - 3 * t) ** 2,
    // 5(1-3t) - [(-3)(5t+2) / (1-3t)^2]
    fout: [(t) => 5 * (1 - 3 * t) - (-3 * (5 * t + 2)) / (1 - 3 * t) ** 2],
  },
  {
    naam: '2e^x/(x-1)',
    antwoord: '2(x-2) e^x / (x-1)^2',
    weg: ['2xe^x- 4e^x /(x-1)^2'],
    blijven: ['2e^x*-(x-1)^(-2)+2e^x*(x-1)^(-1)'],
    afgeleide: (x) => (2 * (x - 2) * Math.exp(x)) / (x - 1) ** 2,
    opgeslagen: (x) => (2 * (x - 2) * Math.exp(x)) / (x - 1) ** 2,
    fout: [(x) => 2 * x * Math.exp(x) - (4 * Math.exp(x)) / (x - 1) ** 2],
  },
]

describe('foute schrijfwijzen uit migratie 0066', () => {
  it('heeft voor elke weggehaalde vorm een som', () => {
    const aantal = sommen.reduce((n, som) => n + som.weg.length, 0)
    expect(aantal).toBe(18)
    expect(sommen).toHaveLength(16)
  })

  for (const som of sommen) {
    it(`${som.naam}: het antwoord is de afgeleide, de weggehaalde vorm niet`, () => {
      expect(gelijk(som.opgeslagen, som.afgeleide), som.naam).toBe(true)
      // coss(x), 2xlinx+x en het woord "keer" zijn geen uitdrukking.
      // Die vallen alleen door de tekstvergelijking.
      if (som.fout.length > 0) {
        expect(som.fout).toHaveLength(som.weg.length)
      }
      for (const vorm of som.fout) {
        expect(ongelijk(vorm, som.afgeleide), som.naam).toBe(true)
      }

      expect(answersMatch(som.antwoord, som.antwoord, som.blijven)).toBe(true)
      for (const goed of som.blijven) {
        expect(answersMatch(goed, som.antwoord, som.blijven), goed).toBe(true)
      }
      for (const fout of som.weg) {
        expect(answersMatch(fout, som.antwoord, som.blijven), fout).toBe(false)
        expect(answersMatch(fout, som.antwoord, [fout]), fout).toBe(true)
      }
    })
  }
})
