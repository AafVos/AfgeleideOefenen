import { describe, expect, it } from 'vitest'

import { insertAtCursor, toLatexPreview } from './input'

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

  it('zet x^(2x-1) om naar x^{2x-1}', () => {
    expect(toLatexPreview('x^(2x-1)')).toBe('x^{2x-1}')
  })

  it('zet sqrt(x) om naar \\sqrt{x}', () => {
    expect(toLatexPreview('sqrt(x)')).toBe('\\sqrt{x}')
  })

  it('ondersteunt een sqrt(...) genest in een andere sqrt(...)', () => {
    expect(toLatexPreview('sqrt(sqrt(x))')).toBe('\\sqrt{\\sqrt{x}}')
  })
})

describe('insertAtCursor', () => {
  it('voegt tekst in op de cursorpositie', () => {
    expect(insertAtCursor('ax', 1, 1, 'b')).toEqual({ value: 'abx', caret: 2 })
  })

  it('vervangt een selectie door de ingevoegde tekst', () => {
    expect(insertAtCursor('abc', 0, 2, 'x')).toEqual({ value: 'xc', caret: 1 })
  })

  it('zet de cursor op de |-markering van de wiskundeknoppen', () => {
    expect(insertAtCursor('', 0, 0, '^(|)')).toEqual({ value: '^()', caret: 2 })
    expect(insertAtCursor('', 0, 0, 'sqrt(|)')).toEqual({ value: 'sqrt()', caret: 5 })
    expect(insertAtCursor('', 0, 0, '(|)/()')).toEqual({ value: '()/()', caret: 1 })
  })
})
