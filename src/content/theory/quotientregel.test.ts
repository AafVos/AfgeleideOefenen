import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import { THEORY_OVERVIEW } from '@/content/theory/afgeleiden'

import {
  QUOTIENTREGEL_FORMULE,
  QUOTIENTREGEL_OMSCHRIJVING,
  QUOTIENTREGEL_PAD,
  QUOTIENTREGEL_STAPPEN,
  QUOTIENTREGEL_TITEL,
  QUOTIENTREGEL_VOORBEELDEN,
} from './quotientregel'

describe('quotientregel-pagina', () => {
  it('heeft een eigen adres, titel en omschrijving', () => {
    expect(QUOTIENTREGEL_PAD).toBe('/theorie/quotientregel')
    expect(QUOTIENTREGEL_TITEL).toBe('Quotiëntregel oefenen')
    expect(QUOTIENTREGEL_OMSCHRIJVING.length).toBeGreaterThan(40)
    expect(QUOTIENTREGEL_OMSCHRIJVING).not.toMatch(/\b(quotient rule|derivative)\b/i)
  })

  it('legt het stappenplan uit met f, g en h, van stap 0 tot en met 3', () => {
    expect(QUOTIENTREGEL_STAPPEN.map((stap) => stap.n)).toEqual([0, 1, 2, 3])
    const tekst = [QUOTIENTREGEL_FORMULE.join(' '), ...QUOTIENTREGEL_STAPPEN.map((stap) => stap.tekst)].join(
      ' ',
    )
    expect(tekst).toContain('f(x)')
    expect(tekst).toContain('g(x)')
    expect(tekst).toContain('h(x)')
    expect(tekst).not.toMatch(/\$[uv]\(/)
    expect(tekst).not.toMatch(/\b[uv]\(/)
  })

  it('geeft drie uitgewerkte voorbeelden met het nagerekende antwoord', () => {
    expect(QUOTIENTREGEL_VOORBEELDEN).toHaveLength(3)
    expect(QUOTIENTREGEL_VOORBEELDEN.map((voorbeeld) => voorbeeld.antwoord)).toEqual([
      "f'(x) = \\dfrac{-7}{(x-2)^2}",
      "f'(x) = \\dfrac{2(x^2+x-4)}{(2x+1)^2}",
      "f'(x) = \\dfrac{1-10x-x^2}{(x^2+1)^2}",
    ])
    for (const voorbeeld of QUOTIENTREGEL_VOORBEELDEN) {
      expect(voorbeeld.stappen).toHaveLength(4)
      expect(voorbeeld.stappen[0]).toMatch(/^Stap 0\./)
      expect(voorbeeld.stappen[3]).toMatch(/^Stap 3\./)
      expect(voorbeeld.stappen.join(' ')).not.toMatch(/\$[uv]\(/)
    }
  })

  it('staat in de sitemap en de overzichtskaart wijst ernaar', () => {
    const urls = sitemap().map((item) => item.url)
    expect(urls.some((url) => url.endsWith(QUOTIENTREGEL_PAD))).toBe(true)

    const kaart = THEORY_OVERVIEW.flatMap((hoofdstuk) => hoofdstuk.cards).find(
      (card) => card.id === 'quotientregel',
    )
    expect(kaart?.id).toBe('quotientregel')
    expect(kaart?.uitlegPad).toBe(QUOTIENTREGEL_PAD)
    expect(kaart?.formula).toEqual([...QUOTIENTREGEL_FORMULE])
    const stappen = (kaart?.examples ?? []).flatMap((voorbeeld) => voorbeeld.steps ?? []).join(' ')
    expect(stappen).toContain('g')
    expect(stappen).not.toMatch(/\$[uv]\(/)
  })
})
