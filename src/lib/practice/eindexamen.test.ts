import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { vraagIsToepassing } from './answer-prefix'
import { answersMatch } from './engine'

const MIGRATIE = 'supabase/migrations/0070_eindexamenvragen.sql'

const vragen = [
  {
    bron: 'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 6',
    tekst:
      'De functie $f$ wordt gegeven door $f(x) = (3x - 7)^{2}$. Stel op exacte wijze een functievoorschrift van $g$ op.',
    voorvoegsel: 'g(x) =',
    antwoord: '(3(x-3)-7)^2+39',
    goed: ['(3(x-3)-7)^2+39', '(3x-16)^2+39', '9x^2-96x+295', '9*x^2 - 96*x + 295'],
    fout: ['(3x-16)^2+40', '9x^2-96x+296'],
  },
  {
    bron: 'CE vwo wiskunde B 2024 · tijdvak 2 · vraag 9',
    tekst:
      'Bereken exact de waarden van $a$, $b$ en $c$. De raaklijn snijdt de $x$-as.',
    voorvoegsel: null,
    antwoord: 'a=(3)/(8), b=-sqrt(3), c=2',
    goed: ['a=3/8, b=-sqrt(3), c=2', '3/8, -sqrt(3), 2', 'a=(3)/(8), b=-√3, c=2'],
    fout: ['a=3/8, b=-3, c=2', 'a=9/8, b=-sqrt(3), c=2'],
  },
  {
    bron: 'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 2',
    tekst: 'Bereken exact de lengte van $AD$. De buigpunten hebben $y$-coördinaat $-125$.',
    voorvoegsel: null,
    antwoord: '10',
    goed: ['10'],
    fout: ['5', '20', '10,5'],
  },
  {
    bron: 'CE vwo wiskunde B 2019 · tijdvak 1 · vraag 8',
    tekst:
      'De functies $f$ en $g$ worden gegeven door $f(x) = x\\ln(x) - x + 1$ en $g(x) = f\'(x)$. Bereken exact de $x$-coördinaten.',
    voorvoegsel: null,
    antwoord: '1 en e',
    goed: ['1 en e', '1, e', 'x=1 of x=e', 'e en 1'],
    fout: ['1', 'e', '0 en 1'],
  },
] as const

describe('eindexamenvragen', () => {
  it('rekent de vier antwoorden na', () => {
    // 2024-1: g(x) = (3(x-3)-7)^2 + 39, helling in x=5 is -6, waarde 40.
    const a = 3
    const b = 39
    const binnen = 3 * (5 - a) - 7
    expect(6 * binnen).toBe(-6)
    expect(binnen ** 2 + b).toBe(40)
    expect((3 * 5 - 16) ** 2 + 39).toBe(40)
    expect(9 * 25 - 96 * 5 + 295).toBe(40)

    // 2024-2: helling door (0, 2) en ((2/3)√3, 0) is -√3. Discriminant 3-8a = 0.
    const helling = -2 / ((2 / 3) * Math.sqrt(3))
    expect(helling).toBeCloseTo(-Math.sqrt(3), 10)
    expect(3 - 8 * (3 / 8)).toBe(0)

    // 2025-1: x^4 - 30x^2 + 125 = 0 geeft x^2 = 5 of 25. Lengte van -5 tot 5 is 10.
    expect(25 - 30 * 5 + 125).toBe(0)
    expect(5 ** 4 - 30 * 25 + 125).toBe(0)
    expect(5 - -5).toBe(10)

    // 2019-1: f'(x) = ln(x). Snijpunt als (x-1)(ln(x)-1) = 0, dus x = 1 of x = e.
    const links = (x: number) => x * Math.log(x) - x + 1
    const rechts = (x: number) => Math.log(x)
    expect(links(1)).toBeCloseTo(rechts(1), 10)
    expect(links(Math.E)).toBeCloseTo(rechts(Math.E), 10)
  })

  it.each(vragen)('$bron: gangbare invoer goed, foute invoer fout', (vraag) => {
    const alternatieven = vraag.goed.filter((goed) => goed !== vraag.antwoord)
    for (const goed of vraag.goed) {
      expect(answersMatch(goed, vraag.antwoord, [...alternatieven]), goed).toBe(true)
    }
    for (const fout of vraag.fout) {
      expect(answersMatch(fout, vraag.antwoord, [...alternatieven]), fout).toBe(false)
    }
  })

  it('valt in het filter voor verhaaltjes', () => {
    for (const vraag of vragen) {
      expect(vraagIsToepassing(vraag.tekst, vraag.voorvoegsel), vraag.bron).toBe(true)
    }
  })

  it('staat zo in de migratie, met bron buiten de vraagtekst', () => {
    const sql = readFileSync(MIGRATIE, 'utf8')
    expect(sql).toContain("title = 'Examenstijl'")
    expect(sql).toContain("VALUES ('examen', 'Eindexamenvragen', 4, 17)")
    expect(sql).toContain('source_label')
    for (const vraag of vragen) {
      expect(sql).toContain(vraag.bron)
      expect(sql).toContain(vraag.antwoord)
    }
  })
})
