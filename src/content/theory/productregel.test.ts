import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import { THEORY_OVERVIEW } from '@/content/theory/afgeleiden'

import {
  PRODUCTREGEL_ANTWOORD_EERST,
  PRODUCTREGEL_FAQ,
  PRODUCTREGEL_FORMULE,
  PRODUCTREGEL_OMSCHRIJVING,
  PRODUCTREGEL_PAD,
  PRODUCTREGEL_STAPPEN,
  PRODUCTREGEL_TITEL,
  PRODUCTREGEL_VOORBEELDEN,
  PRODUCTREGEL_ZOEKTITEL,
} from './productregel'

describe('productregel-pagina', () => {
  it('heeft een eigen adres, titel en omschrijving', () => {
    expect(PRODUCTREGEL_PAD).toBe('/theorie/productregel')
    expect(PRODUCTREGEL_TITEL).toBe('Productregel oefenen')
    expect(PRODUCTREGEL_OMSCHRIJVING.length).toBeGreaterThan(40)
    expect(PRODUCTREGEL_OMSCHRIJVING).not.toMatch(/\b(product rule|derivative)\b/i)
  })

  it('de zoektitel en omschrijving noemen letterlijk de leerlingvraag (AFG-889)', () => {
    expect(PRODUCTREGEL_ZOEKTITEL.toLowerCase()).toContain('productregel differentiëren uitleg vwo')
    expect(PRODUCTREGEL_OMSCHRIJVING.toLowerCase()).toContain(
      'productregel differentiëren uitleg vwo',
    )
  })

  it('toont een antwoord-eerst-zin met f, g en h, geen u of v (AFG-889)', () => {
    expect(PRODUCTREGEL_ANTWOORD_EERST).toMatch(/^Bij de productregel geldt/)
    expect(PRODUCTREGEL_ANTWOORD_EERST).toContain('f′')
    expect(PRODUCTREGEL_ANTWOORD_EERST).toContain('g′')
    expect(PRODUCTREGEL_ANTWOORD_EERST).toContain('h′')
    expect(PRODUCTREGEL_ANTWOORD_EERST).not.toMatch(/\b[uv]['′]/)
  })

  it('heeft 2 tot 3 FAQ-vragen die alleen de pagina-inhoud herhalen (AFG-889)', () => {
    expect(PRODUCTREGEL_FAQ.length).toBeGreaterThanOrEqual(2)
    expect(PRODUCTREGEL_FAQ.length).toBeLessThanOrEqual(3)
    for (const { vraag, antwoord } of PRODUCTREGEL_FAQ) {
      expect(vraag.endsWith('?')).toBe(true)
      expect(antwoord).not.toMatch(/\b[uv]\(/)
    }
    expect(PRODUCTREGEL_FAQ.map((item) => item.antwoord).join(' ')).toContain('productregel')
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
