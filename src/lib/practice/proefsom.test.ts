import { describe, expect, it } from 'vitest'

import nl from '../../../messages/nl.json'

import { proefsomKlopt } from './proefsom'

const NIVEAUS = ['easy', 'medium', 'hard'] as const

describe('proefsom op de startpagina', () => {
  it('keurt een macht met haakjes van het toetsenbord goed', () => {
    expect(proefsomKlopt('hard', '2xe^(x)+x^(2)e^(x)')).toBe(true)
    expect(proefsomKlopt('hard', '2x*e^(x)+x^(2)*e^(x)')).toBe(true)
  })

  it('keurt y = bij de makkelijke som goed', () => {
    expect(proefsomKlopt('easy', 'y = 6x + 5')).toBe(true)
  })

  it('houdt een echt ander antwoord fout', () => {
    expect(proefsomKlopt('easy', '6x + 4')).toBe(false)
  })

  it('keurt de oude schrijfwijzen nog steeds goed', () => {
    expect(proefsomKlopt('easy', '6x+5')).toBe(true)
    expect(proefsomKlopt('easy', '5 + 6x')).toBe(true)
    expect(proefsomKlopt('medium', '3cos(3x)')).toBe(true)
    expect(proefsomKlopt('hard', '(x^2 + 2x)e^x')).toBe(true)
  })

  it.each(NIVEAUS)(
    'het voorbeeld in het antwoordvak van de %s proefsom verklapt het antwoord niet',
    (niveau) => {
      const placeholder = nl.HomeDemo[`${niveau}Placeholder` as 'easyPlaceholder']
      const voorbeeld = placeholder.replace(/^Bijv\.\s*/, '')
      expect(proefsomKlopt(niveau, voorbeeld)).toBe(false)
    },
  )
})
