import { describe, expect, it } from 'vitest'

import { heeftSessiekoekje } from './sessie-koekje'

describe('heeftSessiekoekje', () => {
  it('herkent een sessie', () => {
    expect(heeftSessiekoekje([{ name: 'sb-abc-auth-token' }])).toBe(true)
  })

  it('herkent een sessie die in stukken is geknipt', () => {
    expect(heeftSessiekoekje([{ name: 'sb-abc-auth-token.0' }])).toBe(true)
    expect(heeftSessiekoekje([{ name: 'sb-abc-auth-token.1' }])).toBe(true)
  })

  it('negeert de tussenstap van Google en andere koekjes', () => {
    expect(
      heeftSessiekoekje([{ name: 'sb-abc-auth-token-code-verifier' }]),
    ).toBe(false)
    expect(heeftSessiekoekje([{ name: 'sb-abc-auth-token-code-verifier.0' }])).toBe(
      false,
    )
    expect(heeftSessiekoekje([{ name: 'anders' }])).toBe(false)
    expect(heeftSessiekoekje([])).toBe(false)
  })
})
