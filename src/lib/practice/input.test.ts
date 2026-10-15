import { describe, expect, it } from 'vitest'

import { toLatexPreview } from './input'

describe('toLatexPreview', () => {
  it('zet pi na een cijfer om naar π', () => {
    expect(toLatexPreview('2pi')).toBe('2\\pi')
  })

  it('laat 2*pi en pi/4 goed', () => {
    expect(toLatexPreview('2*pi')).toBe('2\\cdot \\pi')
    expect(toLatexPreview('pi/4')).toBe('\\dfrac{\\pi}{4}')
  })

  it('laat pi in een langer woord staan', () => {
    expect(toLatexPreview('spin')).toBe('spin')
  })
})
