import { describe, expect, it } from 'vitest'

import { hoofdstukCode } from './hoofdstuk-code'

describe('hoofdstukCode', () => {
  it('houdt een boeknummer als H plus het getal', () => {
    expect(hoofdstukCode('h2')).toBe('H2')
    expect(hoofdstukCode('h16')).toBe('H16')
    expect(hoofdstukCode('H10')).toBe('H10')
  })

  it('geeft Beweging de letter B, hoogstens drie tekens', () => {
    expect(hoofdstukCode('beweging')).toBe('B')
    expect(hoofdstukCode('beweging').length).toBeLessThanOrEqual(3)
  })

  it('kapt een onbekende slug af zodat het vakje niet overloopt', () => {
    expect(hoofdstukCode('iets-anders')).toBe('IET')
  })
})
