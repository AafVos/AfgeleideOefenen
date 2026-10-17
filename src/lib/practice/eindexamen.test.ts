import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { vraagIsToepassing } from './answer-prefix'
import { answersMatch } from './engine'

const MIGRATIE = 'supabase/migrations/0070_eindexamenvragen.sql'
const AANVULLING = 'supabase/migrations/0071_eindexamenvragen_aanvulling.sql'

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

const aanvulling = [
  {
    bron: 'CE vwo wiskunde B 2018 · tijdvak 1 · vraag 1',
    tekst: 'Bereken exact de snelheid waarmee $P$ door punt $A$ gaat.',
    voorvoegsel: null,
    antwoord: '2*sqrt(5)',
    goed: ['2*sqrt(5)', '2√5', 'sqrt(20)'],
    fout: ['4', 'sqrt(5)', '20'],
  },
  {
    bron: 'CE vwo wiskunde B 2018 · tijdvak 1 · vraag 8',
    tekst: 'Bereken exact de $x$-coördinaten van alle toppen van de grafiek van $f$.',
    voorvoegsel: 'x =',
    antwoord: '1/2 pi + k*pi',
    goed: ['1/2 pi + k*pi', 'pi/2 + k*pi', 'x=pi/2 + k*pi'],
    fout: ['pi/2', 'k*pi', 'pi + k*pi'],
  },
  {
    bron: 'CE vwo wiskunde B 2019 · tijdvak 2 · vraag 3',
    tekst: 'Bereken algebraïsch de hoek in graden tussen de snelheidsvectoren.',
    voorvoegsel: null,
    antwoord: '29,7',
    goed: ['29,7', '29.7', '29,7 graden'],
    fout: ['30', '29,6', '45'],
  },
  {
    bron: 'CE vwo wiskunde B 2019 · tijdvak 2 · vraag 4',
    tekst: 'Stel op exacte wijze een vergelijking van lijn $l$ op.',
    voorvoegsel: 'y =',
    antwoord: '-3x+7',
    goed: ['-3x+7', 'y=-3x+7', '7-3x'],
    fout: ['-3x+1', '3x+7', '-2x+7'],
  },
  {
    bron: 'CE vwo wiskunde B 2021 · tijdvak 2 · vraag 14',
    tekst: 'Bereken exact deze maximale waarde van de $x$-coördinaat van $S$.',
    voorvoegsel: null,
    antwoord: '1/4',
    goed: ['1/4', '(1)/(4)', '0,25'],
    fout: ['1/2', '1/8', '4'],
  },
  {
    bron: 'CE vwo wiskunde B 2022 · tijdvak 1 · vraag 3',
    tekst: 'Bereken exact de waarde van $p$ waarvoor $y = x$ de gemeenschappelijke raaklijn is.',
    voorvoegsel: 'p =',
    antwoord: 'e',
    goed: ['e', 'p=e'],
    fout: ['1', '2', 'pi'],
  },
  {
    bron: 'CE vwo wiskunde B 2022 · tijdvak 2 · vraag 2',
    tekst: 'Stel door middel van exacte berekeningen een vergelijking op van $k$.',
    voorvoegsel: 'y =',
    antwoord: '-3x+(5)/(4)',
    goed: ['-3x+(5)/(4)', '-3x+5/4', '-3x+1,25'],
    fout: ['-3x+1/2', '-3x+5', '3x+5/4'],
  },
  {
    bron: 'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 1',
    tekst: 'Bereken exact dit minimum.',
    voorvoegsel: null,
    antwoord: '2*sqrt(2)',
    goed: ['2*sqrt(2)', '2√2', 'sqrt(8)'],
    fout: ['sqrt(2)', '4', '2'],
  },
  {
    bron: 'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 6',
    tekst: 'Bereken exact deze waarde van $d$.',
    voorvoegsel: null,
    antwoord: '16',
    goed: ['16', 'd=16'],
    fout: ['8', '4', '32'],
  },
  {
    bron: 'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 8',
    tekst: 'Bereken exact de waarde van $c$.',
    voorvoegsel: 'c =',
    antwoord: 'sqrt(2)',
    goed: ['sqrt(2)', '√2', 'c=sqrt(2)'],
    fout: ['2', '1/2', '4'],
  },
  {
    bron: 'CE vwo wiskunde B 2023 · tijdvak 1 · vraag 10',
    tekst: 'Bereken exact tot welke waarde de helling nadert.',
    voorvoegsel: null,
    antwoord: '-sqrt(2)',
    goed: ['-sqrt(2)', '-√2'],
    fout: ['sqrt(2)', '-2', '0'],
  },
  {
    bron: 'CE vwo wiskunde B 2023 · tijdvak 2 · vraag 1',
    tekst: 'Bereken exact de richtingscoëfficiënt van $l$.',
    voorvoegsel: null,
    antwoord: '2/3',
    goed: ['2/3', '(2)/(3)'],
    fout: ['3/2', '6', '-2/3'],
  },
  {
    bron: 'CE vwo wiskunde B 2023 · tijdvak 2 · vraag 12',
    tekst: 'Bereken exact de $x$-coördinaat van punt $T$.',
    voorvoegsel: 'x =',
    antwoord: '-2',
    goed: ['-2', 'x=-2'],
    fout: ['2', '-3', '0'],
  },
  {
    bron: 'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 10',
    tekst: 'Bereken exact de scherpe hoek in graden tussen de raaklijn en de $x$-as.',
    voorvoegsel: null,
    antwoord: '30',
    goed: ['30', '30 graden'],
    fout: ['45', '60', '15'],
  },
  {
    bron: 'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 3',
    tekst: 'Bereken exact de coördinaten van deze drie punten.',
    voorvoegsel: null,
    antwoord: '(0, 1), (-3/4 sqrt(3), -1/2) en (3/4 sqrt(3), -1/2)',
    goed: [
      '(0, 1), (-3/4 sqrt(3), -1/2) en (3/4 sqrt(3), -1/2)',
      '(0, 1), (3/4 sqrt(3), -1/2) en (-3/4 sqrt(3), -1/2)',
    ],
    fout: ['(0, 1)', '(0, -1), (-3/4 sqrt(3), -1/2) en (3/4 sqrt(3), -1/2)'],
  },
  {
    bron: 'CE vwo wiskunde B 2025 · tijdvak 1 · vraag 9',
    tekst: 'Bereken exact deze waarde van $a$.',
    voorvoegsel: 'a =',
    antwoord: '3',
    goed: ['3', 'a=3'],
    fout: ['2', '9', '-3'],
  },
] as const

describe('eindexamenvragen, aanvulling 2018-2025', () => {
  it('rekent de nieuwe antwoorden na', () => {
    // 2018-1: snelheid op t=1 is √(4+16).
    expect(Math.hypot(-2, 4)).toBeCloseTo(2 * Math.sqrt(5), 10)

    // 2018-1: f'(x)=2cos(x)(3+2sin(x)). Nul als cos(x)=0.
    const f2018 = (x: number) => 6 * Math.sin(x) - Math.cos(2 * x)
    const helling2018 = (x: number) => 6 * Math.cos(x) + 4 * Math.sin(x) * Math.cos(x)
    expect(helling2018(Math.PI / 2)).toBeCloseTo(0, 10)
    expect(helling2018((3 * Math.PI) / 2)).toBeCloseTo(0, 10)
    expect(helling2018(Math.PI)).not.toBeCloseTo(0, 8)
    expect(f2018((3 * Math.PI) / 2)).toBeCloseTo(-5, 10)

    // 2019-2: hoek tussen (-2,1) en (-2,3).
    const cosPhi = 7 / Math.sqrt(65)
    expect((Math.acos(cosPhi) * 180) / Math.PI).toBeCloseTo(29.7, 1)

    // 2019-2: helling links van de knik is -3, lijn door (2,1).
    expect(-3 * 2 + 7).toBe(1)

    // 2021-2: x_S = p - p^2 is maximaal 1/4 bij p=1/2.
    expect(0.5 - 0.5 ** 2).toBe(0.25)

    // 2022-1: p=e, helling van p ln(x) in x=p is 1, en p ln(p)=p.
    expect(Math.E * Math.log(Math.E)).toBeCloseTo(Math.E, 10)

    // 2022-2: buigpunt bij x=1/4, helling -3, waarde 1/2, lijn -3x+5/4.
    const f2022 = (x: number) => 2 * (2 * x - 1) ** 3 + 3 * (2 * x - 1) ** 2
    expect(f2022(0.25)).toBeCloseTo(0.5, 10)
    expect(-3 * 0.25 + 1.25).toBeCloseTo(0.5, 10)

    // 2023-1: minimum van 2x+1/x is 2√2.
    expect(2 * (Math.SQRT1_2) + 1 / Math.SQRT1_2).toBeCloseTo(2 * Math.sqrt(2), 10)

    // 2023-1: d^{3/4}=8 geeft d=16.
    expect(16 ** 0.75).toBeCloseTo(8, 10)

    // 2023-1: snelheid P gedeeld door snelheid Q is √2.
    const t = 1.3
    const snelheidP = Math.sqrt(4 + 16 * t * t)
    const snelheidQ = Math.hypot(1 + 2 * t, 1 - 2 * t)
    expect(snelheidP / snelheidQ).toBeCloseTo(Math.sqrt(2), 10)

    // 2023-1: linkerhelling van |t|√(2t²+2) nadert tot -√2.
    const links = (waarde: number) => {
      const wortel = Math.sqrt(2 * waarde * waarde + 2)
      return -(4 * waarde * waarde + 2) / wortel
    }
    expect(links(0)).toBeCloseTo(-Math.sqrt(2), 10)

    // 2023-2: f'(0)=2/3 voor (x²-2x)/(x-3).
    expect(6 / 9).toBeCloseTo(2 / 3, 10)

    // 2023-2: top van -3 + x√(x+3) bij x=-2.
    const f23 = (x: number) => -3 + x * Math.sqrt(x + 3)
    const af23 = (x: number) => (3 * x + 6) / (2 * Math.sqrt(x + 3))
    expect(af23(-2)).toBeCloseTo(0, 10)
    expect(f23(-2)).toBeCloseTo(-5, 10)

    // 2024-1: helling op t=2π/3 is 1/√3, hoek 30 graden.
    const hoek = (2 / 3) * Math.PI
    const dx = -4 * Math.sin(hoek) - 4 * Math.sin(4 * hoek)
    const dy = 4 * Math.cos(hoek) + 4 * Math.cos(4 * hoek)
    expect(dy / dx).toBeCloseTo(1 / Math.sqrt(3), 10)
    expect((Math.atan(1 / Math.sqrt(3)) * 180) / Math.PI).toBeCloseTo(30, 10)
    const xP = 4 * Math.cos(hoek) + Math.cos(4 * hoek)
    const yP = 4 * Math.sin(hoek) + Math.sin(4 * hoek)
    expect(xP).toBeCloseTo(-2.5, 10)
    expect(yP).toBeCloseTo(2.5 * Math.sqrt(3), 10)

    // 2025-1: verticale raaklijnen.
    const punt = (tijd: number) => ({
      x: Math.sin(tijd) * (Math.cos(tijd) - 1),
      y: Math.cos(tijd),
    })
    expect(punt(0).y).toBeCloseTo(1, 10)
    expect(punt((2 / 3) * Math.PI).x).toBeCloseTo((-3 / 4) * Math.sqrt(3), 10)
    expect(punt((2 / 3) * Math.PI).y).toBeCloseTo(-0.5, 10)
    expect(punt((4 / 3) * Math.PI).x).toBeCloseTo((3 / 4) * Math.sqrt(3), 10)

    // 2025-1: PQ minimaal bij a=3, lengte √2.
    const lengte = (a: number) => 3 * Math.sqrt(2) * a - 4 * Math.sqrt(a * a - 1)
    const afgeleideLengte = (a: number) => 3 * Math.sqrt(2) - (4 * a) / Math.sqrt(a * a - 1)
    expect(afgeleideLengte(3)).toBeCloseTo(0, 10)
    expect(lengte(3)).toBeCloseTo(Math.sqrt(2), 10)
  })

  it.each(aanvulling)('$bron: gangbare invoer goed, foute invoer fout', (vraag) => {
    const alternatieven = vraag.goed.filter((goed) => goed !== vraag.antwoord)
    for (const goed of vraag.goed) {
      expect(answersMatch(goed, vraag.antwoord, [...alternatieven]), goed).toBe(true)
    }
    for (const fout of vraag.fout) {
      expect(answersMatch(fout, vraag.antwoord, [...alternatieven]), fout).toBe(false)
    }
  })

  it('staat in de aanvullende migratie', () => {
    const sql = readFileSync(AANVULLING, 'utf8')
    expect(sql).toContain('n_vragen <> 20 OR n_stappen <> 78')
    for (const vraag of aanvulling) {
      expect(sql).toContain(vraag.bron)
      expect(sql).toContain(vraag.antwoord)
    }
  })
})
