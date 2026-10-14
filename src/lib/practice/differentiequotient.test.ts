import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { answerPrefix } from './answer-prefix'
import { answersMatch } from './engine'

/**
 * De acht opgaven uit migratie 0059.
 * De uitkomst wordt hier opnieuw uitgerekend, los van het opgeslagen antwoord.
 */
const opgaven: Array<{
  tekst: string
  antwoord: string
  f: (x: number) => number
  van: number
  tot: number
}> = [
  {
    tekst:
      'Bereken het differentiequotiënt van $f$ van $x = 2$ tot $x = 6$. Hierbij is $f(x) = 4x + 1$.',
    antwoord: '4',
    f: (x) => 4 * x + 1,
    van: 2,
    tot: 6,
  },
  {
    tekst:
      'Bereken het differentiequotiënt van $g$ van $x = 1$ tot $x = 5$. Hierbij is $g(x) = x^{2}$.',
    antwoord: '6',
    f: (x) => x * x,
    van: 1,
    tot: 5,
  },
  {
    tekst:
      'Een auto rijdt. De afgelegde weg in meter na $t$ seconden is $f(t) = 5t + 2$. Hoe groot is de gemiddelde snelheid van $t = 2$ tot $t = 6$, in meter per seconde?',
    antwoord: '5',
    f: (t) => 5 * t + 2,
    van: 2,
    tot: 6,
  },
  {
    tekst:
      'Bereken het differentiequotiënt van $h$ van $x = 1$ tot $x = 5$. Hierbij is $h(x) = x^{2} - 4x$.',
    antwoord: '2',
    f: (x) => x * x - 4 * x,
    van: 1,
    tot: 5,
  },
  {
    tekst:
      'Een bal wordt omhoog gegooid. De hoogte in meter na $t$ seconden is $g(t) = -4t^{2} + 24t$. Hoe groot is de gemiddelde snelheid van $t = 1$ tot $t = 5$, in meter per seconde?',
    antwoord: '0',
    f: (t) => -4 * t * t + 24 * t,
    van: 1,
    tot: 5,
  },
  {
    tekst:
      'Bereken het differentiequotiënt van $f$ van $x = 0$ tot $x = 2$. Hierbij is $f(x) = x^{3} - 3x$.',
    antwoord: '1',
    f: (x) => x ** 3 - 3 * x,
    van: 0,
    tot: 2,
  },
  {
    tekst:
      'Bereken het differentiequotiënt van $g$ van $x = 1$ tot $x = 4$. Hierbij is $g(x) = 2x^{2} - 6x + 4$.',
    antwoord: '4',
    f: (x) => 2 * x * x - 6 * x + 4,
    van: 1,
    tot: 4,
  },
  {
    tekst:
      'Een drone vliegt. De hoogte in meter na $t$ seconden is $h(t) = t^{2} - 10t + 30$. Hoe groot is de gemiddelde snelheid van $t = 2$ tot $t = 6$, in meter per seconde? Reken een daling negatief.',
    antwoord: '-2',
    f: (t) => t * t - 10 * t + 30,
    van: 2,
    tot: 6,
  },
]

const migratie = readFileSync(
  'supabase/migrations/0059_h2_differentiequotient.sql',
  'utf8',
)

describe('differentiequotiënt en gemiddelde snelheid', () => {
  it('heeft acht opgaven, met f, g en h', () => {
    expect(opgaven).toHaveLength(8)
    const tekst = opgaven.map((opgave) => opgave.tekst).join(' ')
    expect(tekst).toContain('$f')
    expect(tekst).toContain('$g')
    expect(tekst).toContain('$h')
    expect(tekst).not.toMatch(/\$[uv]\(/)
    expect(migratie).not.toMatch(/\$[uv]\(/)
  })

  it('rekent elk antwoord opnieuw uit en keurt leeg of onzin af', () => {
    for (const opgave of opgaven) {
      const uitkomst = (opgave.f(opgave.tot) - opgave.f(opgave.van)) / (opgave.tot - opgave.van)
      expect(uitkomst).toBe(Number(opgave.antwoord))
      expect(migratie).toContain(opgave.tekst)
      expect(migratie).toContain(`$ant$${opgave.antwoord}$ant$`)
      expect(answersMatch(opgave.antwoord, opgave.antwoord)).toBe(true)
      expect(answersMatch('', opgave.antwoord)).toBe(false)
      expect(answersMatch('onzin', opgave.antwoord)).toBe(false)
      expect(answersMatch('999', opgave.antwoord)).toBe(false)
      expect(answerPrefix(opgave.tekst, null)).toBe('')
    }
  })

  it('keurt het tegengestelde van een daling af', () => {
    expect(answersMatch('2', '-2')).toBe(false)
    expect(answersMatch('−2', '-2')).toBe(true)
  })
})
