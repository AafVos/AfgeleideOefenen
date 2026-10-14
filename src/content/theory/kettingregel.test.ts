import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import { THEORY_OVERVIEW } from '@/content/theory/afgeleiden'

import {
  KETTINGREGEL_FORMULE,
  KETTINGREGEL_OMSCHRIJVING,
  KETTINGREGEL_PAD,
  KETTINGREGEL_STAPPEN,
  KETTINGREGEL_TITEL,
  KETTINGREGEL_VOORBEELDEN,
} from './kettingregel'

describe('kettingregel-pagina', () => {
  it('heeft een eigen adres, titel en omschrijving', () => {
    expect(KETTINGREGEL_PAD).toBe('/theorie/kettingregel')
    expect(KETTINGREGEL_TITEL).toBe('Kettingregel oefenen')
    expect(KETTINGREGEL_OMSCHRIJVING.length).toBeGreaterThan(40)
    expect(KETTINGREGEL_OMSCHRIJVING).not.toMatch(/\b(chain rule|derivative)\b/i)
  })

  it('legt het stappenplan uit met f, g en h, van stap 0 tot en met 3', () => {
    expect(KETTINGREGEL_STAPPEN.map((stap) => stap.n)).toEqual([0, 1, 2, 3])
    const tekst = [KETTINGREGEL_FORMULE.join(' '), ...KETTINGREGEL_STAPPEN.map((stap) => stap.tekst)].join(
      ' ',
    )
    expect(tekst).toContain('f(x)')
    expect(tekst).toContain('g')
    expect(tekst).toContain('h(x)')
    expect(tekst).not.toMatch(/\$[uv]\(/)
    expect(tekst).not.toMatch(/\b[uv]\(/)
  })

  it('geeft drie uitgewerkte voorbeelden met het nagerekende antwoord', () => {
    expect(KETTINGREGEL_VOORBEELDEN).toHaveLength(3)
    expect(KETTINGREGEL_VOORBEELDEN.map((voorbeeld) => voorbeeld.antwoord)).toEqual([
      "f'(x) = 8(2x-5)^3",
      "f'(x) = 5(x^2-3x)^4(2x-3)",
      "f'(x) = \\dfrac{5}{2\\sqrt{5x-2}}",
    ])
    for (const voorbeeld of KETTINGREGEL_VOORBEELDEN) {
      expect(voorbeeld.stappen).toHaveLength(4)
      expect(voorbeeld.stappen[0]).toMatch(/^Stap 0\./)
      expect(voorbeeld.stappen[3]).toMatch(/^Stap 3\./)
      expect(voorbeeld.stappen.join(' ')).not.toMatch(/\$[uv]\(/)
    }
  })

  it('staat in de sitemap en de overzichtskaart wijst ernaar', () => {
    const urls = sitemap().map((item) => item.url)
    expect(urls.some((url) => url.endsWith(KETTINGREGEL_PAD))).toBe(true)

    const kaart = THEORY_OVERVIEW.flatMap((hoofdstuk) => hoofdstuk.cards).find(
      (card) => card.id === 'kettingregel',
    )
    expect(kaart?.uitlegPad).toBe(KETTINGREGEL_PAD)
    expect(kaart?.formula).toEqual([...KETTINGREGEL_FORMULE])
    const stappen = (kaart?.examples ?? []).flatMap((voorbeeld) => voorbeeld.steps ?? []).join(' ')
    expect(stappen).toContain('h(x)')
    expect(stappen).not.toMatch(/\$g\(x\)/)
  })
})
