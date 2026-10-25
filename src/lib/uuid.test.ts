import { describe, expect, it } from 'vitest'

import { isGeldigeUuid } from './uuid'

describe('isGeldigeUuid', () => {
  it('accepteert een geldige UUID, ook in hoofdletters', () => {
    expect(isGeldigeUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    expect(isGeldigeUuid('123E4567-E89B-12D3-A456-426614174000')).toBe(true)
  })

  it('wijst tekst af die geen geldige UUID is', () => {
    expect(isGeldigeUuid('niet-een-uuid')).toBe(false)
    expect(isGeldigeUuid('123e4567-e89b-12d3-a456-42661417400')).toBe(false)
    expect(isGeldigeUuid('')).toBe(false)
  })
})
