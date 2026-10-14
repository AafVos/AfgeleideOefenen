import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import { THEORY_OVERVIEW } from '@/content/theory/afgeleiden'

import {
  EXTREME_WAARDEN_FORMULE,
  EXTREME_WAARDEN_OMSCHRIJVING,
  EXTREME_WAARDEN_PAD,
  EXTREME_WAARDEN_STAPPEN,
  EXTREME_WAARDEN_TITEL,
  EXTREME_WAARDEN_VOORBEELDEN,
} from './extreme-waarden'

describe('extreme-waarden-pagina', () => {
  it('heeft een eigen adres, titel en omschrijving', () => {
    expect(EXTREME_WAARDEN_PAD).toBe('/theorie/extreme-waarden')
    expect(EXTREME_WAARDEN_TITEL).toBe('Extreme waarden oefenen')
    expect(EXTREME_WAARDEN_OMSCHRIJVING.length).toBeGreaterThan(40)
    expect(EXTREME_WAARDEN_OMSCHRIJVING).not.toMatch(/\b(extreme value|derivative)\b/i)
  })

  it('legt het stappenplan uit met f, van stap 0 tot en met 3', () => {
    expect(EXTREME_WAARDEN_STAPPEN.map((stap) => stap.n)).toEqual([0, 1, 2, 3])
    const tekst = [
      EXTREME_WAARDEN_FORMULE.join(' '),
      ...EXTREME_WAARDEN_STAPPEN.map((stap) => stap.tekst),
    ].join(' ')
    expect(tekst).toContain("f'(x)")
    expect(tekst).toContain("f''(x)")
    expect(tekst).not.toMatch(/\$[uv]\(/)
    expect(tekst).not.toMatch(/\b[uv]\(/)
  })

  it('geeft drie uitgewerkte voorbeelden met het nagerekende antwoord', () => {
    expect(EXTREME_WAARDEN_VOORBEELDEN).toHaveLength(3)
    expect(EXTREME_WAARDEN_VOORBEELDEN.map((voorbeeld) => voorbeeld.antwoord)).toEqual([
      '\\text{minimum } -4 \\text{ bij } x = 3',
      '\\text{maximum } 5 \\text{ bij } x = 2',
      '\\text{maximum } 16 \\text{ bij } x = -2,\\ \\text{minimum } -16 \\text{ bij } x = 2',
    ])
    for (const voorbeeld of EXTREME_WAARDEN_VOORBEELDEN) {
      expect(voorbeeld.stappen).toHaveLength(4)
      expect(voorbeeld.stappen[0]).toMatch(/^Stap 0\./)
      expect(voorbeeld.stappen[3]).toMatch(/^Stap 3\./)
      expect(voorbeeld.stappen.join(' ')).not.toMatch(/\$[uv]\(/)
    }
  })

  it('staat in de sitemap en de overzichtskaart wijst ernaar', () => {
    const urls = sitemap().map((item) => item.url)
    expect(urls.some((url) => url.endsWith(EXTREME_WAARDEN_PAD))).toBe(true)

    const kaart = THEORY_OVERVIEW.flatMap((hoofdstuk) => hoofdstuk.cards).find(
      (card) => card.id === 'top_tweede',
    )
    expect(kaart?.uitlegPad).toBe(EXTREME_WAARDEN_PAD)
    expect(kaart?.formula).toEqual([...EXTREME_WAARDEN_FORMULE])
    const stappen = (kaart?.examples ?? []).flatMap((voorbeeld) => voorbeeld.steps ?? []).join(' ')
    expect(stappen).toContain('f')
    expect(stappen).not.toMatch(/\$[uv]\(/)
  })
})
