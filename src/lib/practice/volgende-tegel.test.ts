import { describe, expect, it } from 'vitest'

import { pastBijSoort, type SoortKeuze } from './soort-filter'
import { volgendeTegel } from './volgende-tegel'

type Tegel = { questionId: string; verhaal: boolean }

/** Een paragraaf met gewone sommen en verhaaltjes door elkaar. */
const VOLGORDE: Tegel[] = [
  { questionId: 'g1', verhaal: false },
  { questionId: 'v1', verhaal: true },
  { questionId: 'g2', verhaal: false },
  { questionId: 'v2', verhaal: true },
  { questionId: 'g3', verhaal: false },
]

function zichtbaarBij(soort: SoortKeuze): Tegel[] {
  return VOLGORDE.filter((tegel) => pastBijSoort(tegel.verhaal, soort))
}

function volgendeId(soort: SoortKeuze, huidigeId: string | null): string | null {
  return volgendeTegel(zichtbaarBij(soort), VOLGORDE, huidigeId)?.questionId ?? null
}

describe('volgende tegel', () => {
  it('pakt zonder filter gewoon de tegel erna', () => {
    expect(volgendeId('alles', 'g1')).toBe('v1')
    expect(volgendeId('alles', 'v2')).toBe('g3')
  })

  it('begint vooraan als er nog geen opgave open staat', () => {
    expect(volgendeId('alles', null)).toBe('g1')
    expect(volgendeId('verhaal', null)).toBe('v1')
  })

  it('slaat binnen een filter de andere soort over', () => {
    expect(volgendeId('verhaal', 'v1')).toBe('v2')
    expect(volgendeId('gewoon', 'g1')).toBe('g2')
  })

  it('gaat vooruit als de open opgave buiten het filter valt', () => {
    // Filter op verhaaltjes, maar er staat een gewone som open.
    expect(volgendeId('verhaal', 'g1')).toBe('v1')
    expect(volgendeId('verhaal', 'g2')).toBe('v2')
    // Filter op gewone sommen, maar er staat een verhaaltje open.
    expect(volgendeId('gewoon', 'v1')).toBe('g2')
  })

  it('loopt rond als er verderop niets zichtbaars meer is', () => {
    expect(volgendeId('verhaal', 'g3')).toBe('v1')
    expect(volgendeId('verhaal', 'v2')).toBe('v1')
  })

  it('begint vooraan bij een opgave van een ander onderdeel', () => {
    expect(volgendeId('alles', 'ergens-anders')).toBe('g1')
  })

  it('geeft niets terug als er geen tegels zijn', () => {
    expect(volgendeTegel([], VOLGORDE, 'g1')).toBeNull()
    expect(volgendeTegel([], [], null)).toBeNull()
  })
})
