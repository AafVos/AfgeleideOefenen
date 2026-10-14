import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import { THEORY_OVERVIEW } from '@/content/theory/afgeleiden'

import {
  PRODUCTREGEL_FORMULE,
  PRODUCTREGEL_OMSCHRIJVING,
  PRODUCTREGEL_PAD,
  PRODUCTREGEL_STAPPEN,
  PRODUCTREGEL_TITEL,
  PRODUCTREGEL_VOORBEELDEN,
} from './productregel'

describe('productregel-pagina', () => {
  it('heeft een eigen adres, titel en omschrijving', () => {
    expect(PRODUCTREGEL_PAD).toBe('/theorie/productregel')
    expect(PRODUCTREGEL_TITEL).toBe('Productregel oefenen')
    expect(PRODUCTREGEL_OMSCHRIJVING.length).toBeGreaterThan(40)
    expect(PRODUCTREGEL_OMSCHRIJVING).not.toMatch(/\b(product rule|derivative)\b/i)
  })

  it('legt het stappenplan uit met f, g en h, van stap 0 tot en met 3', () => {
    expect(PRODUCTREGEL_STAPPEN.map((stap) => stap.n)).toEqual([0, 1, 2, 3])
    const tekst = [PRODUCTREGEL_FORMULE.join(' '), ...PRODUCTREGEL_STAPPEN.map((stap) => stap.tekst)].join(
      ' ',
    )
    expect(tekst).toContain('f(x)')
    expect(tekst).toContain('g(x)')
    expect(tekst).toContain('h(x)')
    expect(tekst).not.toMatch(/\$[uv]\(/)
    expect(tekst).not.toMatch(/\b[uv]\(/)
  })

  it('geeft drie uitgewerkte voorbeelden met het nagerekende antwoord', () => {
    expect(PRODUCTREGEL_VOORBEELDEN).toHaveLength(3)
    expect(PRODUCTREGEL_VOORBEELDEN.map((voorbeeld) => voorbeeld.antwoord)).toEqual([
      "f'(x) = 6x-10",
      "f'(x) = 6x^2-2x+6",
      "f'(x) = 3x^2",
    ])
    for (const voorbeeld of PRODUCTREGEL_VOORBEELDEN) {
      expect(voorbeeld.stappen).toHaveLength(4)
      expect(voorbeeld.stappen[0]).toMatch(/^Stap 0\./)
      expect(voorbeeld.stappen[3]).toMatch(/^Stap 3\./)
      expect(voorbeeld.stappen.join(' ')).not.toMatch(/\$[uv]\(/)
    }
  })

  it('staat in de sitemap en de overzichtskaart wijst ernaar', () => {
    const urls = sitemap().map((item) => item.url)
    expect(urls.some((url) => url.endsWith(PRODUCTREGEL_PAD))).toBe(true)

    const kaart = THEORY_OVERVIEW.flatMap((hoofdstuk) => hoofdstuk.cards).find(
      (card) => card.id === 'productregel',
    )
    expect(kaart?.uitlegPad).toBe(PRODUCTREGEL_PAD)
    expect(kaart?.formula).toEqual([...PRODUCTREGEL_FORMULE])
    const stappen = (kaart?.examples ?? []).flatMap((voorbeeld) => voorbeeld.steps ?? []).join(' ')
    expect(stappen).toContain('g')
    expect(stappen).not.toMatch(/\$[uv]\(/)
  })
})
