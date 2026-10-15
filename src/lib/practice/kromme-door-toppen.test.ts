import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { answersMatch } from './engine'

/**
 * De acht opgaven uit migratie 0065.
 * Elke kromme wordt hier opnieuw afgeleid, los van de tekst in de migratie:
 * de afgeleide klopt met de functie, op een top is de afgeleide nul, en de
 * y-waarde op die top is de kromme.
 */

type Breuk = { n: number; d: number }

function ggd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const rest = x % y
    x = y
    y = rest
  }
  return x || 1
}

function b(n: number, d = 1): Breuk {
  if (d < 0) {
    n = -n
    d = -d
  }
  const deler = ggd(n, d)
  return { n: n / deler, d: d / deler }
}

function tel(x: Breuk, y: Breuk): Breuk {
  return b(x.n * y.d + y.n * x.d, x.d * y.d)
}

function keer(x: Breuk, y: Breuk): Breuk {
  return b(x.n * y.n, x.d * y.d)
}

function gelijk(x: Breuk, y: Breuk): boolean {
  return x.n === y.n && x.d === y.d
}

function tekst(x: Breuk): string {
  return x.d === 1 ? String(x.n) : `${x.n}/${x.d}`
}

/** Numeriek, alleen om de afgeleide tegen de functie te houden. */
function helling(f: (x: number) => number, x: number): number {
  const h = 1e-5
  return (f(x + h) - f(x - h)) / (2 * h)
}

const MIGRatie = 'supabase/migrations/0065_h6_kromme_door_toppen.sql'

type Opgave = {
  nr: number
  moeilijkheid: number
  antwoord: string
  latex: string
  alternatieven: string[]
  /** Schrijfwijzen die meteen goed moeten zijn, ook zonder de AI. */
  goed: string[]
  /** Formules die fout moeten blijven. */
  fout: string[]
  f: (p: number, x: number) => number
  fB: (p: Breuk, x: Breuk) => Breuk
  fpB: (p: Breuk, x: Breuk) => Breuk
  /** Parameter en x van een top. Meerdere x'en: elke top ligt op de kromme. */
  punten: Array<{ p: Breuk; x: Breuk }>
  kromme: (x: Breuk) => Breuk
}

const kwadraat = (x: Breuk) => keer(x, x)
const derdemacht = (x: Breuk) => keer(x, kwadraat(x))

const parameters = [-4, -2, -1, 0, 1, 2, 3, 5].map((n) => b(n))
const ookBreuk = [b(-3, 2), b(-1, 2), b(1, 3), b(2, 3), b(5, 2)]
const alleP = [...parameters, ...ookBreuk]

/** Bij x^3 - 3px bestaan toppen als de parameter een kwadraat is. */
const wortels = [-6, -3, -2, -1, 1, 2, 4, 5].map((k) => ({
  p: b(k * k),
  x: b(k),
}))

const opgaven: Opgave[] = [
  {
    nr: 1,
    moeilijkheid: 1,
    antwoord: 'x^2',
    latex: 'x^{2}',
    alternatieven: ['1x^2', '(x^2)'],
    goed: ['x^2', 'y = x^2', 'y=x^(2)', 'X^2', '1x^2', '(x^2)', 'x^(2)'],
    fout: ['-x^2', '2x^2', 'x^3', '4ax-x^2', '-2x+4a', '0', ''],
    f: (a, x) => -x * x + 4 * a * x,
    fB: (a, x) => tel(keer(b(-1), kwadraat(x)), keer(keer(b(4), a), x)),
    fpB: (a, x) => tel(keer(b(-2), x), keer(b(4), a)),
    punten: alleP.map((a) => ({ p: a, x: keer(b(2), a) })),
    kromme: (x) => kwadraat(x),
  },
  {
    nr: 2,
    moeilijkheid: 1,
    antwoord: '-x^2',
    latex: '-x^{2}',
    alternatieven: ['-1x^2', '(-1)x^2', '(-x^2)'],
    goed: ['-x^2', 'y = -x^2', '-x^(2)', '-1x^2', '(-1)x^2', '(-x^2)'],
    fout: ['x^2', '-2x^2', '2x-2p', '-x', '0', ''],
    f: (p, x) => x * x - 2 * p * x,
    fB: (p, x) => tel(kwadraat(x), keer(keer(b(-2), p), x)),
    fpB: (p, x) => tel(keer(b(2), x), keer(b(-2), p)),
    punten: alleP.map((p) => ({ p, x: p })),
    kromme: (x) => keer(b(-1), kwadraat(x)),
  },
  {
    nr: 3,
    moeilijkheid: 2,
    antwoord: '-x^2+x',
    latex: '-x^{2}+x',
    alternatieven: ['x-x^2', '-x^2+1x', '1x-x^2', 'x+(-x^2)', '(-x^2)+x'],
    goed: [
      '-x^2+x',
      'y = -x^2 + x',
      '-x^(2)+x',
      'x-x^2',
      'x - x^2',
      'x+-x^2',
      '-x^2+1x',
      '1x-x^2',
      'x+(-x^2)',
    ],
    fout: ['x^2-x', '-x^2-x', 'x^2+x', '-x^2', 'x', '2x-x^2', ''],
    f: (a, x) => x * x - 2 * a * x + a,
    fB: (a, x) => tel(tel(kwadraat(x), keer(keer(b(-2), a), x)), a),
    fpB: (a, x) => tel(keer(b(2), x), keer(b(-2), a)),
    punten: alleP.map((a) => ({ p: a, x: a })),
    kromme: (x) => tel(keer(b(-1), kwadraat(x)), x),
  },
  {
    nr: 4,
    moeilijkheid: 2,
    antwoord: '-(3)/(4)x^2',
    latex: '-\\dfrac{3}{4}x^{2}',
    alternatieven: [
      '-(3/4)x^2',
      '(-3)/(4)x^2',
      '(-3/4)x^2',
      '-3/4x^2',
      '(-3)/4x^2',
      '-3/(4)x^2',
      '-(3x^2)/(4)',
      '-(3x^2)/4',
      '-3x^2/4',
      '-3x^2/(4)',
      '-0.75x^2',
      '-0,75x^2',
      '-(0.75)x^2',
      '-(0,75)x^2',
      '(-0.75)x^2',
      '(-0,75)x^2',
    ],
    goed: [
      '-(3)/(4)x^2',
      'y = -(3)/(4)x^(2)',
      '-(3/4)x^2',
      '-3/4x^2',
      '-3x^2/4',
      '-(3x^2)/(4)',
      '-0.75x^2',
      '-0,75x^2',
      '-\\dfrac{3}{4}x^2',
    ],
    fout: [
      '-(1)/(4)x^2',
      '-(3)/(4)x',
      '-3x^2',
      '(3)/(4)x^2',
      '-x^2',
      '-(3)/(2)x^2',
      '',
    ],
    f: (p, x) => x * x - 4 * p * x + p * p,
    fB: (p, x) => tel(tel(kwadraat(x), keer(keer(b(-4), p), x)), kwadraat(p)),
    fpB: (p, x) => tel(keer(b(2), x), keer(b(-4), p)),
    punten: alleP.map((p) => ({ p, x: keer(b(2), p) })),
    kromme: (x) => keer(b(-3, 4), kwadraat(x)),
  },
  {
    nr: 5,
    moeilijkheid: 2,
    antwoord: '-2x^3',
    latex: '-2x^{3}',
    alternatieven: ['(-2)x^3', '(-2x^3)'],
    goed: ['-2x^3', 'y = -2x^3', '-2x^(3)', '(-2)x^3', '-2*x^3'],
    fout: ['-x^3', '2x^3', '-3x^3', 'x^2', '-2x^2', '-2x', ''],
    f: (a, x) => x * x * x - 3 * a * x,
    fB: (a, x) => tel(derdemacht(x), keer(keer(b(-3), a), x)),
    fpB: (a, x) => tel(keer(b(3), kwadraat(x)), keer(b(-3), a)),
    punten: wortels,
    kromme: (x) => keer(b(-2), derdemacht(x)),
  },
  {
    nr: 6,
    moeilijkheid: 3,
    antwoord: '-2x^3+5',
    latex: '-2x^{3}+5',
    alternatieven: ['5-2x^3', '5+(-2)x^3', '5+(-2x^3)', '(-2)x^3+5', '(-2x^3)+5'],
    goed: [
      '-2x^3+5',
      'y = -2x^3 + 5',
      '5-2x^3',
      '5 - 2x^(3)',
      '5+-2x^3',
      '(-2)x^3+5',
      '-2*x^3+5',
    ],
    fout: ['-2x^3', '2x^3+5', '-2x^3-5', '5-2x^2', '-3x^3+5', '5', ''],
    f: (p, x) => x * x * x - 3 * p * x + 5,
    fB: (p, x) => tel(tel(derdemacht(x), keer(keer(b(-3), p), x)), b(5)),
    fpB: (p, x) => tel(keer(b(3), kwadraat(x)), keer(b(-3), p)),
    punten: wortels,
    kromme: (x) => tel(keer(b(-2), derdemacht(x)), b(5)),
  },
  {
    nr: 7,
    moeilijkheid: 3,
    antwoord: '-(1)/(2)x^3',
    latex: '-\\dfrac{1}{2}x^{3}',
    alternatieven: [
      '-(1/2)x^3',
      '(-1)/(2)x^3',
      '(-1/2)x^3',
      '-1/2x^3',
      '(-1)/2x^3',
      '-1/(2)x^3',
      '-x^3/2',
      '-(x^3)/2',
      '-(x^3)/(2)',
      '-x^3/(2)',
      '-0.5x^3',
      '-0,5x^3',
      '-(0.5)x^3',
      '-(0,5)x^3',
      '(-0.5)x^3',
      '(-0,5)x^3',
    ],
    goed: [
      '-(1)/(2)x^3',
      'y = -(1)/(2)x^(3)',
      '-(1/2)x^3',
      '-x^3/2',
      '-(x^3)/(2)',
      '-0.5x^3',
      '-0,5x^3',
      '-\\dfrac{1}{2}x^3',
    ],
    fout: ['-x^3', '-(1)/(2)x^2', '(1)/(2)x^3', '-2x^3', '0', 'x^3/2', ''],
    f: (a, x) => x * x * x - 3 * a * x * x,
    fB: (a, x) => tel(derdemacht(x), keer(keer(b(-3), a), kwadraat(x))),
    fpB: (a, x) => tel(keer(b(3), kwadraat(x)), keer(keer(b(-6), a), x)),
    punten: alleP.flatMap((a) => [
      { p: a, x: b(0) },
      { p: a, x: keer(b(2), a) },
    ]),
    kromme: (x) => keer(b(-1, 2), derdemacht(x)),
  },
  {
    nr: 8,
    moeilijkheid: 3,
    antwoord: '-x^2-(4)/(3)x',
    latex: '-x^{2}-\\dfrac{4}{3}x',
    alternatieven: [
      '-x^2-(4/3)x',
      '-x^2-4/3x',
      '-x^2-(4)/3x',
      '-x^2-4/(3)x',
      '-(4)/(3)x-x^2',
      '-(4/3)x-x^2',
      '-4/3x-x^2',
      '-(4)/3x-x^2',
      '-4/(3)x-x^2',
      '-x^2-(4x)/(3)',
      '-x^2-(4x)/3',
      '-(4x)/(3)-x^2',
      '-(4x)/3-x^2',
      '(-4)/(3)x-x^2',
      '(-4/3)x-x^2',
      '-x^2+(-4)/(3)x',
      '-x^2+(-4/3)x',
    ],
    goed: [
      '-x^2-(4)/(3)x',
      'y = -x^2 - (4)/(3)x',
      '-x^(2)-(4)/(3)x',
      '-x^2-(4/3)x',
      '-x^2-4/3x',
      '-(4)/(3)x-x^2',
      '-4/3x-x^2',
      '-x^2-(4x)/(3)',
      '-(4x)/3-x^2',
      '(-4)/(3)x-x^2',
    ],
    fout: [
      '-x^2-(4)/(3)',
      '-x^2+(4)/(3)x',
      'x^2-(4)/(3)x',
      '-(4)/(3)x',
      '-x^2',
      '-x^2-(2)/(3)x',
      '-x^2-(4)/(3)x^2',
      '',
    ],
    f: (k, x) => x * x + 6 * k * x + 4 * k,
    fB: (k, x) => tel(tel(kwadraat(x), keer(keer(b(6), k), x)), keer(b(4), k)),
    fpB: (k, x) => tel(keer(b(2), x), keer(b(6), k)),
    punten: alleP.map((k) => ({ p: k, x: keer(b(-3), k) })),
    kromme: (x) => tel(keer(b(-1), kwadraat(x)), keer(b(-4, 3), x)),
  },
]

describe('kromme door de toppen', () => {
  it('heeft acht verschillende opgaven', () => {
    expect(opgaven).toHaveLength(8)
    expect(new Set(opgaven.map((o) => o.antwoord)).size).toBe(8)
  })

  it.each(opgaven)('opgave $nr: de afgeleide hoort bij de functie', (opgave) => {
    for (const p of [-2.5, -1, 0.5, 1, 3]) {
      for (const x of [-2, -0.5, 0.4, 1.7, 3]) {
        const gemeten = helling((t) => opgave.f(p, t), x)
        const xp = tNaarGetal(opgave.fpB(bVanGetal(p), bVanGetal(x)))
        expect(Math.abs(gemeten - xp)).toBeLessThan(1e-4)
      }
    }
  })

  it.each(opgaven)('opgave $nr: elke top ligt op de kromme', (opgave) => {
    expect(opgave.punten.length).toBeGreaterThan(0)
    for (const punt of opgave.punten) {
      const afgeleide = opgave.fpB(punt.p, punt.x)
      const y = opgave.fB(punt.p, punt.x)
      const verwacht = opgave.kromme(punt.x)
      expect({
        nr: opgave.nr,
        p: tekst(punt.p),
        x: tekst(punt.x),
        afgeleide: tekst(afgeleide),
        y: tekst(y),
      }).toEqual({
        nr: opgave.nr,
        p: tekst(punt.p),
        x: tekst(punt.x),
        afgeleide: '0',
        y: tekst(verwacht),
      })
    }
  })

  it('de parameter valt weg tot de opgeslagen formule', () => {
    // 1. a = x/2, y = -x^2 + 4*(x/2)*x
    expect(gelijk(tel(b(-1), keer(b(4), b(1, 2))), b(1))).toBe(true)
    // 2. p = x, y = x^2 - 2*x*x
    expect(gelijk(tel(b(1), b(-2)), b(-1))).toBe(true)
    // 3. a = x, y = x^2 - 2x^2 + x. De lineaire term blijft x.
    expect(gelijk(tel(b(1), b(-2)), b(-1))).toBe(true)
    // 4. p = x/2, y = x^2 - 4*(x/2)*x + (x/2)^2
    expect(
      gelijk(tel(tel(b(1), keer(b(-4), b(1, 2))), keer(b(1, 2), b(1, 2))), b(-3, 4)),
    ).toBe(true)
    // 5. a = x^2, y = x^3 - 3*x^2*x
    expect(gelijk(tel(b(1), b(-3)), b(-2))).toBe(true)
    // 6. dezelfde macht als opgave 5, plus de constante 5 uit de functie
    // 7. a = x/2, y = x^3 - 3*(x/2)*x^2
    expect(gelijk(tel(b(1), keer(b(-3), b(1, 2))), b(-1, 2))).toBe(true)
    // 8. k = -x/3, y = x^2 + 6*(-x/3)*x + 4*(-x/3)
    expect(gelijk(tel(b(1), keer(b(6), b(-1, 3))), b(-1))).toBe(true)
    expect(gelijk(keer(b(4), b(-1, 3)), b(-4, 3))).toBe(true)
  })

  it.each(opgaven)('opgave $nr: gangbare schrijfwijze goed, foute formule fout', (opgave) => {
    for (const goed of opgave.goed) {
      expect(answersMatch(goed, opgave.antwoord, opgave.alternatieven), goed).toBe(true)
    }
    for (const fout of opgave.fout) {
      expect(answersMatch(fout, opgave.antwoord, opgave.alternatieven), fout).toBe(false)
    }
  })

  it('de migratie bevat dezelfde antwoorden als deze narekening', () => {
    const sql = readFileSync(MIGRatie, 'utf8')
    const vragen = [
      ...sql.matchAll(
        /\(\s*(\d+),\s*(\d+),\s*\$vraag\$[\s\S]*?\$vraag\$,\s*\$ant\$([^$]*)\$ant\$,\s*\$latex\$([^$]*)\$latex\$,\s*'y =',\s*ARRAY\[([^\]]*)\]/g,
      ),
    ]
    const controle = [
      ...sql.matchAll(
        /\(\s*(\d+),\s*(\d+),\s*\$ant\$([^$]*)\$ant\$,\s*\$latex\$([^$]*)\$latex\$,\s*'y =',\s*ARRAY\[([^\]]*)\]/g,
      ),
    ]
    expect(vragen).toHaveLength(8)
    expect(controle).toHaveLength(8)
    for (const opgave of opgaven) {
      const rij = vragen.find((m) => Number(m[1]) === opgave.nr)
      const check = controle.find((m) => Number(m[1]) === opgave.nr)
      expect(rij?.[2]).toBe(String(opgave.moeilijkheid))
      expect(rij?.[3]).toBe(opgave.antwoord)
      expect(rij?.[4]).toBe(opgave.latex)
      expect(leesLijst(rij?.[5] ?? '')).toEqual(opgave.alternatieven)
      expect(check?.[2]).toBe(String(opgave.moeilijkheid))
      expect(check?.[3]).toBe(opgave.antwoord)
      expect(check?.[4]).toBe(opgave.latex)
      expect(leesLijst(check?.[5] ?? '')).toEqual(opgave.alternatieven)
    }
  })
})

function leesLijst(body: string): string[] {
  return [...body.matchAll(/'((?:[^']|'')*)'/g)].map((m) => m[1].replace(/''/g, "'"))
}

/** Alleen voor de numerieke controle van de afgeleide. Breuken blijven exact. */
function bVanGetal(n: number): Breuk {
  const tekstGetal = String(n)
  const komma = tekstGetal.split('.')[1]
  if (!komma) return b(n)
  const schaal = 10 ** komma.length
  return b(Math.round(n * schaal), schaal)
}

function tNaarGetal(x: Breuk): number {
  return x.n / x.d
}
