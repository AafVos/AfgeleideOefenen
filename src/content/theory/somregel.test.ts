import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import { THEORY_OVERVIEW } from '@/content/theory/afgeleiden'

import {
  SOMREGEL_FORMULE,
  SOMREGEL_OMSCHRIJVING,
  SOMREGEL_PAD,
  SOMREGEL_STAPPEN,
  SOMREGEL_TITEL,
  SOMREGEL_VOORBEELDEN,
} from './somregel'

describe('somregel-pagina', () => {
  it('heeft een eigen adres, titel en omschrijving', () => {
    expect(SOMREGEL_PAD).toBe('/theorie/somregel')
    expect(SOMREGEL_TITEL).toBe('Somregel oefenen')
    expect(SOMREGEL_OMSCHRIJVING.length).toBeGreaterThan(40)
    expect(SOMREGEL_OMSCHRIJVING).not.toMatch(/\b(sum rule|derivative)\b/i)
  })

  it('legt het stappenplan uit met f, g en h, van stap 0 tot en met 3', () => {
    expect(SOMREGEL_STAPPEN.map((stap) => stap.n)).toEqual([0, 1, 2, 3])
    const tekst = [SOMREGEL_FORMULE.join(' '), ...SOMREGEL_STAPPEN.map((stap) => stap.tekst)].join(' ')
    expect(tekst).toContain('f(x)')
    expect(tekst).toContain('g(x)')
    expect(tekst).toContain('h(x)')
    expect(tekst).not.toMatch(/\$[uv]\(/)
    expect(tekst).not.toMatch(/\b[uv]\(/)
  })

  it('geeft drie uitgewerkte voorbeelden met het nagerekende antwoord', () => {
    expect(SOMREGEL_VOORBEELDEN).toHaveLength(3)
    expect(SOMREGEL_VOORBEELDEN.map((voorbeeld) => voorbeeld.antwoord)).toEqual([
      "f'(x) = 10x^4 - 6x",
      "f'(x) = 4x^3 + 6",
      "f'(x) = 15x^2 - 2x + 4",
    ])
    for (const voorbeeld of SOMREGEL_VOORBEELDEN) {
      expect(voorbeeld.stappen).toHaveLength(4)
      expect(voorbeeld.stappen[0]).toMatch(/^Stap 0\./)
      expect(voorbeeld.stappen[3]).toMatch(/^Stap 3\./)
      expect(voorbeeld.stappen.join(' ')).not.toMatch(/\$[uv]\(/)
    }
  })

  it('staat in de sitemap en de overzichtskaart wijst ernaar', () => {
    const urls = sitemap().map((item) => item.url)
    expect(urls.some((url) => url.endsWith(SOMREGEL_PAD))).toBe(true)

    const kaart = THEORY_OVERVIEW.flatMap((hoofdstuk) => hoofdstuk.cards).find(
      (card) => card.id === 'somregel',
    )
    expect(kaart?.uitlegPad).toBe(SOMREGEL_PAD)
    expect(kaart?.formula).toEqual([...SOMREGEL_FORMULE])
    const stappen = (kaart?.examples ?? []).flatMap((voorbeeld) => voorbeeld.steps ?? []).join(' ')
    expect(stappen).toContain('f')
    expect(stappen).not.toMatch(/\$[uv]\(/)
  })
})
