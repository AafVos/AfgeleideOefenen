import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { answersMatch, normalizeAnswer } from './engine'

/**
 * Migratie 0085: de laatste LaTeX-restjes in answer/answer_alternatives die
 * normalizeAnswer niet wegnormaliseert (vervolg op 0058).
 *
 * normalizeAnswer zet "^(...)" (ronde haakjes) om naar een kale exponent,
 * maar "^{...}" (accolades) helemaal niet. En "\cdot" wordt alleen tussen
 * twee cijfers een ×; ernaast een haakje of letter, dan blijft hij staan.
 * Dat bewijzen de twee tests hieronder, los van de migratie.
 */
describe('normalizeAnswer: waarom de accolade- en \\cdot-vormen kapot waren', () => {
  it('laat "^{...}" met accolades letterlijk staan, anders dan "^(...)"', () => {
    expect(normalizeAnswer('8e^(-1)')).toBe('8e^-1')
    expect(normalizeAnswer('8e^{-1}')).toBe('8e^{-1}')
    expect(normalizeAnswer('8e^(-1)')).not.toBe(normalizeAnswer('8e^{-1}'))
  })

  it('zet \\cdot tussen twee cijfers wel om, maar niet naast een haakje', () => {
    expect(normalizeAnswer('2 \\cdot 4(4x - 3)')).toBe(normalizeAnswer('2*4(4x-3)'))
    expect(normalizeAnswer('2 \\cdot (4x + 1)')).not.toBe(normalizeAnswer('2*(4x + 1)'))
  })
})

const MIGRATIE = 'supabase/migrations/0085_laatste_latex_restjes_antwoorden.sql'

type Vraag = {
  naam: string
  antwoord: string
  alternatieven: string[]
  /** De kapotte vorm(en) die er met deze migratie uit gaan. */
  restjes: string[]
  /** Een paar schrijfwijzen die een leerling kan typen en die goed horen te zijn. */
  goed: string[]
  /**
   * Letterlijke tekst die in migratie 0085 zelf moet staan. Standaard de
   * hele alternatievenlijst; bij h2 (waar alleen het answer-veld verandert)
   * expliciet gezet.
   */
  inMigratie?: string[]
}

const vragen: Vraag[] = [
  {
    naam: 'h9 emacht_in_een_verhaal #2',
    antwoord: '8/e',
    alternatieven: ['8e^(-1)', '(8)/e', '(8)/(e)'],
    restjes: ['8e^{-1}'],
    goed: ['8/e', '8e^(-1)', '8e^-1', '(8)/(e)'],
  },
  {
    naam: 'h9 emacht_in_een_verhaal #4',
    antwoord: '15/e',
    alternatieven: ['15e^(-1)', '(15)/e', '(15)/(e)'],
    restjes: ['15e^{-1}'],
    goed: ['15/e', '15e^(-1)'],
  },
  {
    naam: 'h9 emacht_in_een_verhaal #6',
    antwoord: '10/e',
    alternatieven: ['10e^(-1)', '(10)/e', '(10)/(e)'],
    restjes: ['10e^{-1}'],
    goed: ['10/e', '10e^(-1)'],
  },
  {
    naam: 'h9 emacht_in_een_verhaal #8',
    antwoord: '24/e',
    alternatieven: ['24e^(-1)', '(24)/e', '(24)/(e)'],
    restjes: ['24e^{-1}'],
    goed: ['24/e', '24e^(-1)'],
  },
  {
    naam: 'h15 waarde_van_de_top #6',
    antwoord: '2/e',
    alternatieven: ['2e^(-1)', '(2)/e', '(2)/(e)', 'W=2/e', 'W=(2)/(e)', 'W=2e^(-1)'],
    restjes: ['2e^{-1}', 'W=2e^{-1}'],
    goed: ['2/e', '2e^(-1)', 'W=2e^(-1)'],
  },
  {
    naam: 'h15 voorraad #7',
    antwoord: '20/e',
    alternatieven: ['20e^(-1)', '(20)/e', '(20)/(e)', 'V=20/e', 'V=20e^(-1)', 'V=(20)/e', 'V=(20)/(e)'],
    restjes: ['20e^{-1}', 'V=20e^{-1}'],
    goed: ['20/e', '20e^(-1)', 'V=20e^(-1)'],
  },
  {
    naam: 'h15 voorraad #8',
    antwoord: '24/e^2',
    alternatieven: ['24/e^(2)', '24e^(-2)', '(24)/e^2', '(24)/(e^2)', 'V=24/e^2', 'V=24/e^(2)', 'V=24e^(-2)', 'V=(24)/e^2'],
    restjes: ['24/e^{2}', '24e^{-2}', 'V=24/e^{2}', 'V=24e^{-2}'],
    goed: ['24/e^2', '24/e^(2)', '24e^(-2)', '(24)/(e^2)'],
  },
  {
    naam: 'h16 helling_in_een_punt #5',
    antwoord: '3e',
    alternatieven: ['3e^(1)', 'e*3', '3*e'],
    restjes: ['3e^{1}'],
    goed: ['3e', '3e^(1)', 'e*3', '3*e'],
  },
  {
    naam: 'h16 raaklijn #7',
    antwoord: 'x/e',
    alternatieven: [
      '(1/e)x',
      'x*e^(-1)',
      'y = x/e',
      '(x)/(e)',
      '(x)/e',
      'y=(1/e)x',
      'y=x*e^(-1)',
      'y=(x)/(e)',
      'y=(x)/e',
    ],
    restjes: ['x*e^{-1}', 'y=x*e^{-1}'],
    goed: ['x/e', 'x*e^(-1)', 'y=x*e^(-1)'],
  },
  {
    naam: 'h16 top #8',
    antwoord: 'sqrt(2)',
    alternatieven: ['√2', '2^(1/2)'],
    restjes: ['2^{1/2}'],
    goed: ['sqrt(2)', '√2', '2^(1/2)'],
  },
  {
    naam: 'h16 kleinste_of_grootste #5',
    antwoord: '3/e',
    alternatieven: ['3e^(-1)', '(3)/e', '(3)/(e)'],
    restjes: ['3e^{-1}'],
    goed: ['3/e', '3e^(-1)'],
  },
  {
    naam: 'h16 kleinste_of_grootste #8',
    antwoord: '1/e^2',
    alternatieven: ['e^(-2)', '1/e^(2)', '(1)/(e^2)'],
    restjes: ['e^{-2}', '1/e^{2}', '(1)/(e^{2})'],
    goed: ['1/e^2', 'e^(-2)', '1/e^(2)', '(1)/(e^2)'],
  },
  {
    naam: 'h2_productregel kwadraat_van_polynoom #8',
    antwoord: '2*(4x + 1)(2x^2 + x)',
    alternatieven: ['16x^3 + 12x^2 + 2x'],
    restjes: ['2 \\cdot (4x + 1)(2x^{2} + x)'],
    goed: ['2*(4x+1)(2x^2+x)', '16x^3+12x^2+2x'],
    // De alternatieven zelf zet 0047 al goed neer; 0085 verandert hier
    // alleen het answer-veld.
    inMigratie: ['2*(4x + 1)(2x^2 + x)'],
  },
  {
    naam: 'h2_quotientregel polynoom_breuk #8',
    antwoord: '(2x(x^2 - 2) - (x^2 + 1)*2x)/(x^2 - 2)^2',
    alternatieven: ['-6x/(x^2 - 2)^2', '(2x(x² - 2) - (x² + 1)*2x)/(x² - 2)²'],
    restjes: ['(2x(x^2 - 2) - (x^2 + 1) \\cdot 2x)/(x^2 - 2)^2'],
    goed: ['-6x/(x^2 - 2)^2', '(2x(x² - 2) - (x² + 1)*2x)/(x² - 2)²'],
    inMigratie: [
      '(2x(x^2 - 2) - (x^2 + 1)*2x)/(x^2 - 2)^2',
      '(2x(x² - 2) - (x² + 1)*2x)/(x² - 2)²',
    ],
  },
]

describe('migratie 0085: laatste LaTeX-restjes antwoorden', () => {
  it.each(vragen)('$naam: geen \\ of {}/} meer in answer/answer_alternatives', (vraag) => {
    const alles = [vraag.antwoord, ...vraag.alternatieven].join('|')
    expect(alles).not.toMatch(/[{}\\]/)
  })

  it.each(vragen)('$naam: gangbare schrijfwijzen blijven goed', (vraag) => {
    for (const vorm of vraag.goed) {
      expect(answersMatch(vorm, vraag.antwoord, vraag.alternatieven), vorm).toBe(true)
    }
  })

  it('de migratie schrijft voor elke vraag de nieuwe vorm weg', () => {
    const sql = readFileSync(MIGRATIE, 'utf8')
    for (const vraag of vragen) {
      for (const tekst of vraag.inMigratie ?? vraag.alternatieven) {
        expect(sql, `${vraag.naam}: ${tekst}`).toContain(tekst)
      }
    }
  })
})
