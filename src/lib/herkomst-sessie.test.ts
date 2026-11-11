import { describe, expect, it } from 'vitest'

import { bewaarEersteHerkomst, herkomstUitZoekreeks, opgehaaldeHerkomst } from './herkomst-sessie'
import type { Bewaarplek } from './meten/melden'

/** Een `sessionStorage` van niks, zodat dit zonder browser te testen is. */
function nepOpslag(begin: Record<string, string> = {}): Bewaarplek & {
  inhoud: Map<string, string>
} {
  const inhoud = new Map(Object.entries(begin))
  return {
    inhoud,
    getItem: (sleutel) => inhoud.get(sleutel) ?? null,
    setItem: (sleutel, waarde) => void inhoud.set(sleutel, waarde),
    removeItem: (sleutel) => void inhoud.delete(sleutel),
  }
}

describe('herkomstUitZoekreeks', () => {
  it('leest ?van= uit de adresregel', () => {
    expect(herkomstUitZoekreeks('?van=youtube')).toBe('youtube')
  })

  it('leest utm_source en vertaalt chatgpt.com naar chatgpt', () => {
    expect(herkomstUitZoekreeks('?utm_source=chatgpt.com')).toBe('chatgpt')
  })

  it('geeft voorrang aan ?van= boven utm_source', () => {
    expect(herkomstUitZoekreeks('?van=docent&utm_source=chatgpt.com')).toBe('docent')
  })

  it('geeft null zonder herkenbare parameter', () => {
    expect(herkomstUitZoekreeks('')).toBeNull()
    expect(herkomstUitZoekreeks('?chapter=h2')).toBeNull()
    expect(herkomstUitZoekreeks('?van=reclame')).toBeNull()
  })
})

describe('bewaarEersteHerkomst en opgehaaldeHerkomst', () => {
  it('onthoudt de herkomst van de eerste pagina van dit bezoek', () => {
    const opslag = nepOpslag()
    bewaarEersteHerkomst(opslag, '?van=youtube')
    expect(opgehaaldeHerkomst(opslag)).toBe('youtube')
  })

  it('laat een latere pagina zonder herkomst de eerdere niet overschrijven', () => {
    const opslag = nepOpslag()
    bewaarEersteHerkomst(opslag, '?van=youtube')
    bewaarEersteHerkomst(opslag, '')
    expect(opgehaaldeHerkomst(opslag)).toBe('youtube')
  })

  it('laat een latere, andere herkomst de eerdere niet overschrijven', () => {
    const opslag = nepOpslag()
    bewaarEersteHerkomst(opslag, '?van=youtube')
    bewaarEersteHerkomst(opslag, '?van=docent')
    expect(opgehaaldeHerkomst(opslag)).toBe('youtube')
  })

  it('bewaart niets als er geen herkenbare herkomst in zit', () => {
    const opslag = nepOpslag()
    bewaarEersteHerkomst(opslag, '?chapter=h2')
    expect(opgehaaldeHerkomst(opslag)).toBeNull()
  })

  it('geeft null als er niets is opgeslagen', () => {
    expect(opgehaaldeHerkomst(nepOpslag())).toBeNull()
  })
})
