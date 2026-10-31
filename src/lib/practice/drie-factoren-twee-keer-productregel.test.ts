import { describe, expect, it } from 'vitest'

/**
 * Migratie 0093 legt "drie factoren" uit als twee keer de productregel:
 * groepeer de eerste twee factoren tot P, differentieer P, en differentieer
 * dan f als product van P en de derde factor. Deze test controleert
 * numeriek, los van de migratietekst, dat die route op hetzelfde antwoord
 * uitkomt als de (ongewijzigd gebleven) laatste stap — zie
 * `src/lib/practice/kromme-door-toppen.test.ts` voor hetzelfde idee bij een
 * andere migratie.
 */

type Opgave = {
  nr: number
  /** f, opgebouwd uit drie factoren. */
  f: (x: number) => number
  /** P = product van de eerste twee factoren. */
  P: (x: number) => number
  /** P', met de productregel op de eerste twee factoren. */
  Pafgeleide: (x: number) => number
  /** De derde factor en zijn afgeleide. */
  derde: (x: number) => number
  derdeAfgeleide: (x: number) => number
  /** De al bestaande, ongewijzigde eindformule (laatste stap). */
  eindformule: (x: number) => number
}

function numeriekeAfgeleide(f: (x: number) => number, x: number): number {
  const h = 1e-5
  return (f(x + h) - f(x - h)) / (2 * h)
}

const opgaven: Opgave[] = [
  {
    nr: 1,
    f: (x) => x * (x - 1) * (x + 2),
    P: (x) => x * (x - 1),
    Pafgeleide: (x) => 1 * (x - 1) + x * 1,
    derde: (x) => x + 2,
    derdeAfgeleide: () => 1,
    eindformule: (x) => (x - 1) * (x + 2) + x * (x + 2) + x * (x - 1),
  },
  {
    nr: 2,
    f: (t) => t * (t - 1) * (t + 2),
    P: (t) => t * (t - 1),
    Pafgeleide: (t) => 1 * (t - 1) + t * 1,
    derde: (t) => t + 2,
    derdeAfgeleide: () => 1,
    eindformule: (t) => (t - 1) * (t + 2) + t * (t + 2) + t * (t - 1),
  },
  {
    nr: 3,
    f: (x) => (x + 1) * (x - 2) * (2 * x + 3),
    P: (x) => (x + 1) * (x - 2),
    Pafgeleide: (x) => 1 * (x - 2) + (x + 1) * 1,
    derde: (x) => 2 * x + 3,
    derdeAfgeleide: () => 2,
    eindformule: (x) => (x - 2) * (2 * x + 3) + (x + 1) * (2 * x + 3) + 2 * (x + 1) * (x - 2),
  },
  {
    nr: 4,
    f: (x) => x * (x + 1) * (x - 3),
    P: (x) => x * (x + 1),
    Pafgeleide: (x) => 1 * (x + 1) + x * 1,
    derde: (x) => x - 3,
    derdeAfgeleide: () => 1,
    eindformule: (x) => (x + 1) * (x - 3) + x * (x - 3) + x * (x + 1),
  },
  {
    nr: 5,
    f: (x) => (x - 1) * (x + 1) * (x + 4),
    P: (x) => (x - 1) * (x + 1),
    Pafgeleide: (x) => 1 * (x + 1) + (x - 1) * 1,
    derde: (x) => x + 4,
    derdeAfgeleide: () => 1,
    eindformule: (x) => (x + 1) * (x + 4) + (x - 1) * (x + 4) + (x - 1) * (x + 1),
  },
  {
    nr: 6,
    f: (x) => 2 * x * (x + 3) * (x - 1),
    P: (x) => 2 * x * (x + 3),
    Pafgeleide: (x) => 2 * (x + 3) + 2 * x * 1,
    derde: (x) => x - 1,
    derdeAfgeleide: () => 1,
    eindformule: (x) => 2 * (x + 3) * (x - 1) + 2 * x * (x - 1) + 2 * x * (x + 3),
  },
  {
    nr: 7,
    f: (x) => (x + 2) * (x - 4) * (x + 5),
    P: (x) => (x + 2) * (x - 4),
    Pafgeleide: (x) => 1 * (x - 4) + (x + 2) * 1,
    derde: (x) => x + 5,
    derdeAfgeleide: () => 1,
    eindformule: (x) => (x - 4) * (x + 5) + (x + 2) * (x + 5) + (x + 2) * (x - 4),
  },
  {
    nr: 8,
    f: (x) => x ** 2 * (x - 1) * (x + 3),
    P: (x) => x ** 2 * (x - 1),
    Pafgeleide: (x) => 2 * x * (x - 1) + x ** 2 * 1,
    derde: (x) => x + 3,
    derdeAfgeleide: () => 1,
    eindformule: (x) => 2 * x * (x - 1) * (x + 3) + x ** 2 * (x + 3) + x ** 2 * (x - 1),
  },
]

const X_WAARDEN = [-4, -2.5, -1, 0, 0.5, 1, 2, 3.5]

describe.each(opgaven)('drie_factoren vraag $nr: twee keer de productregel', (o) => {
  it('P is echt het product van de eerste twee factoren, en P komt overeen met de numerieke afgeleide', () => {
    for (const x of X_WAARDEN) {
      expect(numeriekeAfgeleide(o.P, x)).toBeCloseTo(o.Pafgeleide(x), 3)
    }
  })

  it('f is echt het product van P en de derde factor', () => {
    for (const x of X_WAARDEN) {
      expect(o.P(x) * o.derde(x)).toBeCloseTo(o.f(x), 6)
    }
  })

  it('tweede keer de productregel (P en de derde factor) geeft de echte afgeleide van f', () => {
    for (const x of X_WAARDEN) {
      const viaTweeKeerProductregel = o.Pafgeleide(x) * o.derde(x) + o.P(x) * o.derdeAfgeleide(x)
      expect(viaTweeKeerProductregel).toBeCloseTo(numeriekeAfgeleide(o.f, x), 3)
    }
  })

  it('komt overeen met de bestaande, ongewijzigde eindformule (laatste stap)', () => {
    for (const x of X_WAARDEN) {
      const viaTweeKeerProductregel = o.Pafgeleide(x) * o.derde(x) + o.P(x) * o.derdeAfgeleide(x)
      expect(viaTweeKeerProductregel).toBeCloseTo(o.eindformule(x), 6)
    }
  })
})
