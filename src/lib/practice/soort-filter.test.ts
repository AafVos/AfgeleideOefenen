import { describe, expect, it } from 'vitest'

import { vraagIsToepassing } from './answer-prefix'
import { leesSoort, pastBijSoort, teltSoorten, toonSoortFilter } from './soort-filter'

/**
 * Echte opgaven uit de migraties. De tekst staat daar letterlijk zo in
 * de database; hier controleren we of de indeling klopt.
 */
const ECHTE_VRAGEN: Array<{ bron: string; tekst: string; verhaal: boolean }> = [
  {
    bron: '0059',
    tekst:
      'Bereken het differentiequotiënt van $f$ van $x = 2$ tot $x = 6$. Hierbij is $f(x) = 4x + 1$.',
    verhaal: true,
  },
  {
    bron: '0059',
    tekst:
      'Een auto rijdt. De afgelegde weg in meter na $t$ seconden is $f(t) = 5t + 2$. Hoe groot is de gemiddelde snelheid van $t = 2$ tot $t = 6$, in meter per seconde?',
    verhaal: true,
  },
  {
    bron: '0059',
    tekst:
      'Een bal wordt omhoog gegooid. De hoogte in meter na $t$ seconden is $g(t) = -4t^{2} + 24t$. Hoe groot is de gemiddelde snelheid van $t = 1$ tot $t = 5$, in meter per seconde?',
    verhaal: true,
  },
  {
    bron: '0044',
    tekst:
      'Je volgt een drone. De plaats in meter na $t$ seconden is $x(t) = 3t$ en $y(t) = 4t$, met $t \\geq 0$. Hoe groot is de snelheid op $t = 2$, in meter per seconde?',
    verhaal: true,
  },
  {
    bron: '0067',
    tekst: 'h(x) = (x^{2} - 2x + 3)^{3}',
    verhaal: false,
  },
  {
    bron: '0051',
    tekst: 'f(x) = \\dfrac{x^{2} - 1}{6 - x^{2}}',
    verhaal: false,
  },
  {
    bron: 'seed',
    tekst: 'f(x) = 4x^{3}',
    verhaal: false,
  },
]

describe('echte vragen', () => {
  it('deelt kale sommen en verhaaltjes met dezelfde regel', () => {
    for (const vraag of ECHTE_VRAGEN) {
      expect(vraagIsToepassing(vraag.tekst, null), vraag.bron).toBe(vraag.verhaal)
    }
  })

  it('telt een voorvoegsel als verhaaltje, ook bij een kale formule', () => {
    expect(vraagIsToepassing('s(t) = 3t^2', 't =')).toBe(true)
    expect(vraagIsToepassing('s(t) = 3t^2', null)).toBe(false)
  })
})

describe('soortfilter', () => {
  it('blijft weg als er maar één soort is', () => {
    expect(toonSoortFilter(teltSoorten([{ verhaal: false }, { verhaal: false }]))).toBe(false)
    expect(toonSoortFilter(teltSoorten([{ verhaal: true }]))).toBe(false)
    expect(
      toonSoortFilter(teltSoorten([{ verhaal: false }, { verhaal: true }])),
    ).toBe(true)
  })

  it('laat alleen de gekozen soort door', () => {
    expect(pastBijSoort(true, 'alles')).toBe(true)
    expect(pastBijSoort(false, 'alles')).toBe(true)
    expect(pastBijSoort(true, 'verhaal')).toBe(true)
    expect(pastBijSoort(false, 'verhaal')).toBe(false)
    expect(pastBijSoort(false, 'gewoon')).toBe(true)
    expect(pastBijSoort(true, 'gewoon')).toBe(false)
  })

  it('leest alleen een bekende keuze', () => {
    expect(leesSoort('verhaal')).toBe('verhaal')
    expect(leesSoort('anders')).toBeNull()
    expect(leesSoort(null)).toBeNull()
  })
})
