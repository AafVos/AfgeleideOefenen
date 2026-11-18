import { describe, expect, it } from 'vitest'

import { heeftAlGeantwoord, leesToonHint, onthoudEersteAntwoord } from './antwoord-hint'
import type { Bewaarplek } from '@/lib/meten/melden'

/** Een `sessionStorage` van niks, zodat dit zonder browser te testen is. */
function nepOpslag(): Bewaarplek & { inhoud: Map<string, string> } {
  const inhoud = new Map<string, string>()
  return {
    inhoud,
    getItem: (sleutel) => inhoud.get(sleutel) ?? null,
    setItem: (sleutel, waarde) => void inhoud.set(sleutel, waarde),
    removeItem: (sleutel) => void inhoud.delete(sleutel),
  }
}

describe('heeftAlGeantwoord en onthoudEersteAntwoord', () => {
  it('de hint hoort aan te staan bij een lege sessie: nog geen antwoord gehad', () => {
    expect(heeftAlGeantwoord(nepOpslag())).toBe(false)
  })

  it('onthoudt het eerste antwoord, zodat de hint daarna uit hoort', () => {
    const opslag = nepOpslag()
    onthoudEersteAntwoord(opslag)
    expect(heeftAlGeantwoord(opslag)).toBe(true)
  })

  it('blijft uit staan bij een volgende opgave in dezelfde sessie', () => {
    const opslag = nepOpslag()
    onthoudEersteAntwoord(opslag)
    onthoudEersteAntwoord(opslag)
    expect(heeftAlGeantwoord(opslag)).toBe(true)
  })
})

describe('leesToonHint', () => {
  it('geeft false zonder browser (bijvoorbeeld tijdens het renderen op de server)', () => {
    expect(leesToonHint()).toBe(false)
  })
})
