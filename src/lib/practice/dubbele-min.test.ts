import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { answersMatch } from './engine'

/**
 * De twee sommen uit migratie 0074: "som met breuk" bij de quotiëntregel.
 * Het antwoord stond in een dubbele-min-vorm, de rest van die soort som in
 * de korte vorm. Hier wordt elke afgeleide opnieuw nagerekend, en
 * gecontroleerd dat de korte vorm én de oude vorm goed gerekend worden.
 */

const MIGRATIE = 'supabase/migrations/0074_quotientregel_dubbele_min_weg.sql'

// Niet x = 3 en niet q = 0,5: daar staat een nul onder de streep.
const PUNTEN = [-2, 2, 4.5]

/** Numeriek, alleen om de afgeleide tegen de functie te houden. */
function helling(f: (x: number) => number, x: number): number {
  const h = 1e-6
  return (f(x + h) - f(x - h)) / (2 * h)
}

type Som = {
  nr: number
  naam: string
  /** Wat er nu opgeslagen staat: de korte vorm. */
  antwoord: string
  latex: string
  /** De oude dubbele-min-vorm, die goed moet blijven. */
  oud: string
  /** Schrijfwijzen die meteen goed moeten zijn, zonder de AI. */
  goed: string[]
  /** Vormen die fout moeten blijven. */
  fout: string[]
  f: (x: number) => number
  /** De korte vorm als functie, los uitgerekend. */
  afgeleide: (x: number) => number
  /** De oude vorm als functie: moet dezelfde waarde geven. */
  oudeVorm: (x: number) => number
}

const sommen: Som[] = [
  {
    nr: 5,
    naam: 'f(x) = x^3 + (2x+1)/(x-3)',
    antwoord: '3x^2 - 7/(x - 3)^2',
    latex: '3x^{2} - \\dfrac{7}{(x - 3)^{2}}',
    oud: '3x^2 + (-7)/(x - 3)^2',
    goed: ['3x^2 - 7/(x - 3)^2', '3x^2-7/(x-3)^2', '3x² - 7/(x-3)²'],
    fout: [
      '3x^2 + 7/(x - 3)^2',
      '3x^2 - 7/(x + 3)^2',
      '3x^2',
      '2x - 7/(x - 3)^2',
      '',
    ],
    f: (x) => x ** 3 + (2 * x + 1) / (x - 3),
    // teller: 2(x-3) - (2x+1) = -7
    afgeleide: (x) => 3 * x ** 2 - 7 / (x - 3) ** 2,
    oudeVorm: (x) => 3 * x ** 2 + -7 / (x - 3) ** 2,
  },
  {
    nr: 6,
    naam: 'h(q) = q^2 - (q+1)/(2q-1)',
    antwoord: '2q + 3/(2q - 1)^2',
    latex: '2q + \\dfrac{3}{(2q - 1)^{2}}',
    oud: '2q - (-3)/(2q - 1)^2',
    goed: ['2q + 3/(2q - 1)^2', '2q+3/(2q-1)^2', '2q + 3/(2q-1)²'],
    fout: [
      '2q - 3/(2q - 1)^2',
      '2q + 3/(2q + 1)^2',
      '2q',
      '2q + 3/(2q - 1)',
      '',
    ],
    f: (q) => q ** 2 - (q + 1) / (2 * q - 1),
    // teller: 1(2q-1) - 2(q+1) = -3, met het minteken ervoor: +3
    afgeleide: (q) => 2 * q + 3 / (2 * q - 1) ** 2,
    oudeVorm: (q) => 2 * q - -3 / (2 * q - 1) ** 2,
  },
]

describe('dubbele-min-antwoorden uit migratie 0074', () => {
  for (const som of sommen) {
    it(`${som.naam}: de korte vorm is de afgeleide`, () => {
      for (const x of PUNTEN) {
        expect(som.afgeleide(x)).toBeCloseTo(helling(som.f, x), 4)
        expect(som.oudeVorm(x)).toBeCloseTo(som.afgeleide(x), 9)
      }
    })

    it(`${som.naam}: oude en nieuwe schrijfwijze zijn allebei goed`, () => {
      const alternatieven = [som.oud]
      expect(answersMatch(som.antwoord, som.antwoord, alternatieven)).toBe(true)
      expect(answersMatch(som.oud, som.antwoord, alternatieven)).toBe(true)
      for (const vorm of som.goed) {
        expect(answersMatch(vorm, som.antwoord, alternatieven), vorm).toBe(true)
      }
      for (const vorm of som.fout) {
        expect(answersMatch(vorm, som.antwoord, alternatieven), vorm).toBe(false)
      }
    })

    it(`${som.naam}: zonder de oude vorm erbij werd de korte vorm fout gerekend`, () => {
      // Dit is waarom de migratie nodig was: de nakijkcode rekent een breuk
      // met een letter in de noemer niet uit, dus de twee vormen waren
      // alleen als tekst te vergelijken.
      expect(answersMatch(som.antwoord, som.oud, [])).toBe(false)
    })
  }

  it('de migratie zet precies deze twee antwoorden om', () => {
    const sql = readFileSync(MIGRATIE, 'utf8')
    for (const som of sommen) {
      const rij = new RegExp(
        `\\$o${som.nr}\\$([^$]*)\\$o${som.nr}\\$,\\s*` +
          `\\$n${som.nr}\\$([^$]*)\\$n${som.nr}\\$,\\s*` +
          `\\$l${som.nr}\\$(.*)\\$l${som.nr}\\$`,
        'g',
      )
      const treffers = [...sql.matchAll(rij)]
      // Eén keer in de UPDATE, één keer in het controleblok.
      expect(treffers, som.naam).toHaveLength(2)
      for (const treffer of treffers) {
        expect(treffer[1]).toBe(som.oud)
        expect(treffer[2]).toBe(som.antwoord)
        expect(treffer[3]).toBe(som.latex)
      }
    }
  })
})
