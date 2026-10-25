import { describe, expect, it } from 'vitest'

import { MIN_RAAKVLAK, raakvlak } from './raakvlak'

describe('raakvlak', () => {
  it('is minstens 44 punten hoog (ontwerpregels telefoon)', () => {
    expect(MIN_RAAKVLAK).toBeGreaterThanOrEqual(44)
    expect(raakvlak().minHeight).toBe(MIN_RAAKVLAK)
  })

  it('laat eigen stijl toe zonder de minimale hoogte te verkleinen', () => {
    const stijl = raakvlak({ marginTop: 8 })
    expect(stijl.marginTop).toBe(8)
    expect(stijl.minHeight).toBeGreaterThanOrEqual(44)
  })

  it('kan de minimale hoogte niet per ongeluk overschreven worden door eigen stijl', () => {
    const stijl = raakvlak({ minHeight: 20 })
    expect(stijl.minHeight).toBe(MIN_RAAKVLAK)
  })
})
