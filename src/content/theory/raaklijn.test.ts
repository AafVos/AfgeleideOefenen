import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import { THEORY_OVERVIEW } from '@/content/theory/afgeleiden'

import {
  RAAKLIJN_FORMULE,
  RAAKLIJN_OMSCHRIJVING,
  RAAKLIJN_PAD,
  RAAKLIJN_STAPPEN,
  RAAKLIJN_TITEL,
  RAAKLIJN_VOORBEELDEN,
} from './raaklijn'

describe('raaklijn-pagina', () => {
  it('heeft een eigen adres, titel en omschrijving', () => {
    expect(RAAKLIJN_PAD).toBe('/theorie/raaklijn')
    expect(RAAKLIJN_TITEL).toBe('Raaklijn oefenen')
    expect(RAAKLIJN_OMSCHRIJVING.length).toBeGreaterThan(40)
    expect(RAAKLIJN_OMSCHRIJVING).not.toMatch(/\b(tangent|derivative)\b/i)
  })

  it('legt het stappenplan uit met f, van stap 0 tot en met 3', () => {
    expect(RAAKLIJN_STAPPEN.map((stap) => stap.n)).toEqual([0, 1, 2, 3])
    const tekst = [RAAKLIJN_FORMULE.join(' '), ...RAAKLIJN_STAPPEN.map((stap) => stap.tekst)].join(' ')
    expect(tekst).toContain('f(a)')
    expect(tekst).toContain("f'(a)")
    expect(tekst).not.toMatch(/\$[uv]\(/)
    expect(tekst).not.toMatch(/\b[uv]\(/)
  })

  it('geeft drie uitgewerkte voorbeelden met het nagerekende antwoord', () => {
    expect(RAAKLIJN_VOORBEELDEN).toHaveLength(3)
    expect(RAAKLIJN_VOORBEELDEN.map((voorbeeld) => voorbeeld.antwoord)).toEqual([
      'y = 5x - 1',
      'y = 8x - 16',
      'y = 1 - x',
    ])
    for (const voorbeeld of RAAKLIJN_VOORBEELDEN) {
      expect(voorbeeld.stappen).toHaveLength(4)
      expect(voorbeeld.stappen[0]).toMatch(/^Stap 0\./)
      expect(voorbeeld.stappen[3]).toMatch(/^Stap 3\./)
      expect(voorbeeld.stappen.join(' ')).not.toMatch(/\$[uv]\(/)
    }
  })

  it('staat in de sitemap en de overzichtskaart wijst ernaar', () => {
    const urls = sitemap().map((item) => item.url)
    expect(urls.some((url) => url.endsWith(RAAKLIJN_PAD))).toBe(true)

    const kaart = THEORY_OVERVIEW.flatMap((hoofdstuk) => hoofdstuk.cards).find(
      (card) => card.id === 'raaklijn',
    )
    expect(kaart?.uitlegPad).toBe(RAAKLIJN_PAD)
    expect(kaart?.formula).toEqual([...RAAKLIJN_FORMULE])
    const stappen = (kaart?.examples ?? []).flatMap((voorbeeld) => voorbeeld.steps ?? []).join(' ')
    expect(stappen).toContain('f')
    expect(stappen).not.toMatch(/\$[uv]\(/)
  })
})
