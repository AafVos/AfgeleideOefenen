import { describe, expect, it } from 'vitest'

import { tokenizeRichMath } from './rich-math'

describe('tokenizeRichMath', () => {
  it('geeft puur tekst als één tekst-token', () => {
    expect(tokenizeRichMath('gewone tekst')).toEqual([{ type: 'text', value: 'gewone tekst' }])
  })

  it('herkent een inline formule tussen $...$', () => {
    expect(tokenizeRichMath('bereken $f(x) = x^2$ nu')).toEqual([
      { type: 'text', value: 'bereken ' },
      { type: 'math', value: 'f(x) = x^2', display: false },
      { type: 'text', value: ' nu' },
    ])
  })

  it('herkent een displayformule tussen $$...$$', () => {
    expect(tokenizeRichMath('$$x^2$$')).toEqual([{ type: 'math', value: 'x^2', display: true }])
  })

  it('laat een niet-gesloten $ als gewone tekst staan', () => {
    expect(tokenizeRichMath('5 dollar: $')).toEqual([{ type: 'text', value: '5 dollar: $' }])
  })
})
