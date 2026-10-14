import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import { THEORY_OVERVIEW } from '@/content/theory/afgeleiden'

import {
  MACHTSREGEL_FORMULE,
  MACHTSREGEL_OMSCHRIJVING,
  MACHTSREGEL_PAD,
  MACHTSREGEL_STAPPEN,
  MACHTSREGEL_TITEL,
  MACHTSREGEL_VOORBEELDEN,
} from './machtsregel'

describe('machtsregel-pagina', () => {
  it('heeft een eigen adres, titel en omschrijving', () => {
    expect(MACHTSREGEL_PAD).toBe('/theorie/machtsregel')
    expect(MACHTSREGEL_TITEL).toBe('Machtsregel oefenen')
    expect(MACHTSREGEL_OMSCHRIJVING.length).toBeGreaterThan(40)
    expect(MACHTSREGEL_OMSCHRIJVING).not.toMatch(/\b(power rule|derivative)\b/i)
  })

  it('legt het stappenplan uit met f, van stap 0 tot en met 3', () => {
    expect(MACHTSREGEL_STAPPEN.map((stap) => stap.n)).toEqual([0, 1, 2, 3])
    const tekst = [MACHTSREGEL_FORMULE.join(' '), ...MACHTSREGEL_STAPPEN.map((stap) => stap.tekst)].join(
      ' ',
    )
    expect(tekst).toContain('f(x)')
    expect(tekst).toContain('ax^n')
    expect(tekst).not.toMatch(/\$[uv]\(/)
    expect(tekst).not.toMatch(/\b[uv]\(/)
  })

  it('geeft drie uitgewerkte voorbeelden met het nagerekende antwoord', () => {
    expect(MACHTSREGEL_VOORBEELDEN).toHaveLength(3)
    expect(MACHTSREGEL_VOORBEELDEN.map((voorbeeld) => voorbeeld.antwoord)).toEqual([
      "f'(x) = 15x^2",
      "f'(x) = -24x^5",
      "f'(x) = 4x^7",
    ])
    for (const voorbeeld of MACHTSREGEL_VOORBEELDEN) {
      expect(voorbeeld.stappen).toHaveLength(4)
      expect(voorbeeld.stappen[0]).toMatch(/^Stap 0\./)
      expect(voorbeeld.stappen[3]).toMatch(/^Stap 3\./)
      expect(voorbeeld.stappen.join(' ')).not.toMatch(/\$[uv]\(/)
    }
  })

  it('staat in de sitemap en de overzichtskaart wijst ernaar', () => {
    const urls = sitemap().map((item) => item.url)
    expect(urls.some((url) => url.endsWith(MACHTSREGEL_PAD))).toBe(true)

    const kaart = THEORY_OVERVIEW.flatMap((hoofdstuk) => hoofdstuk.cards).find(
      (card) => card.id === 'machtsregel',
    )
    expect(kaart?.uitlegPad).toBe(MACHTSREGEL_PAD)
    expect(kaart?.formula).toEqual([...MACHTSREGEL_FORMULE])
    const stappen = (kaart?.examples ?? []).flatMap((voorbeeld) => voorbeeld.steps ?? []).join(' ')
    expect(stappen).toContain('f')
    expect(stappen).not.toMatch(/\$[uv]\(/)
  })
})
