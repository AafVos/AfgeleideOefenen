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

  describe('wortel', () => {
    it('zet sqrt(...) om naar \\sqrt{...}', () => {
      expect(toLatexPreview('sqrt(x)')).toBe('\\sqrt{x}')
      expect(toLatexPreview('sqrt(x+1)')).toBe('\\sqrt{x+1}')
    })

    it('ondersteunt geneste haakjes binnen sqrt(...), inclusief de breuk erin', () => {
      expect(toLatexPreview('sqrt((x+1)/(x-2))')).toBe('\\sqrt{\\dfrac{x+1}{x-2}}')
    })

    it('ondersteunt twee losse sqrt(...) in dezelfde uitdrukking', () => {
      expect(toLatexPreview('sqrt(x)+sqrt(y)')).toBe('\\sqrt{x}+\\sqrt{y}')
    })

    it('ondersteunt een sqrt(...) genest in een andere sqrt(...)', () => {
      expect(toLatexPreview('sqrt(sqrt(x))')).toBe('\\sqrt{\\sqrt{x}}')
    })

    it('zet √(...) en √token om naar \\sqrt{...}', () => {
      expect(toLatexPreview('√(x+1)')).toBe('\\sqrt{x+1}')
      expect(toLatexPreview('√x')).toBe('\\sqrt{x}')
    })
  })

  describe('exponent', () => {
    it('zet a^b om naar a^{b}', () => {
      expect(toLatexPreview('x^2')).toBe('x^{2}')
    })

    it('zet a^(...) om naar a^{...}, ook met min en breuk erin', () => {
      expect(toLatexPreview('x^(2x-1)')).toBe('x^{2x-1}')
      expect(toLatexPreview('x^(-1/2)')).toBe('x^{-1/2}')
    })
  })

  describe('ontbrekend grondtal (AFG-697)', () => {
    it('^(4), ingevoegd door de machtsknop vóór er een grondtal getypt is, krijgt een vakje als grondtal', () => {
      expect(toLatexPreview('^(4)')).toBe('\\square^{4}')
    })

    it('^4 zonder haakjes en zonder grondtal krijgt ook een vakje', () => {
      expect(toLatexPreview('^4')).toBe('\\square^{4}')
    })

    it('een grondtal ná een +, *, ( of spatie telt ook als ontbrekend', () => {
      expect(toLatexPreview('3+^(2)')).toBe('3+\\square^{2}')
      expect(toLatexPreview('(^(2))')).toBe('(\\square^{2})')
    })

    it('blijft normaal werken zodra er wél een grondtal staat', () => {
      expect(toLatexPreview('x^(4)')).toBe('x^{4}')
      expect(toLatexPreview('4^(2)')).toBe('4^{2}')
      expect(toLatexPreview('(x+1)^(2)')).toBe('(x+1)^{2}')
      expect(toLatexPreview('sqrt(x)^(2)')).toBe('\\sqrt{x}^{2}')
    })

    it('onaffe macht zonder grondtal krijgt aan beide kanten een vakje', () => {
      expect(toLatexPreview('^()')).toBe('\\square^{\\square}')
      expect(toLatexPreview('^(-1')).toBe('\\square^{-1\\square}')
      expect(toLatexPreview('^')).toBe('\\square^{\\square}')
    })
  })

  describe('onaffe macht (placeholder tijdens het typen)', () => {
    it('x^() wordt x^{□}', () => {
      expect(toLatexPreview('x^()')).toBe('x^{\\square}')
    })

    it('x^(-1 (haakje nog niet gesloten) wordt x^{-1□}', () => {
      expect(toLatexPreview('x^(-1')).toBe('x^{-1\\square}')
    })

    it('x^ (niets erachter) wordt x^{□}', () => {
      expect(toLatexPreview('x^')).toBe('x^{\\square}')
    })

    it('x^( (haakje open, niets erin) wordt ook x^{□}', () => {
      expect(toLatexPreview('x^(')).toBe('x^{\\square}')
    })
  })

  describe('breuk', () => {
    it('(a)/(b) wordt \\dfrac{a}{b}', () => {
      expect(toLatexPreview('(2x)/(x+1)')).toBe('\\dfrac{2x}{x+1}')
    })

    it('kale a/b wordt \\dfrac{a}{b} als het simpele tokens zijn', () => {
      expect(toLatexPreview('2/3')).toBe('\\dfrac{2}{3}')
      expect(toLatexPreview('x/4')).toBe('\\dfrac{x}{4}')
    })

    it('breuk midden in een grotere uitdrukking (noemer loopt door tot de +)', () => {
      expect(toLatexPreview('1/2x+3')).toBe('\\dfrac{1}{2x}+3')
    })

    it('lege teller of noemer krijgt een placeholder-vakje', () => {
      expect(toLatexPreview('()/(x)')).toBe('\\dfrac{\\square}{x}')
      expect(toLatexPreview('(x)/()')).toBe('\\dfrac{x}{\\square}')
    })
  })
})

describe('insertAtCursor', () => {
  it('voegt tekst in op de cursorpositie zonder selectie', () => {
    expect(insertAtCursor('ax', 1, 1, 'b')).toEqual({ value: 'abx', caret: 2 })
  })

  it('voegt tekst in aan het begin en aan het eind van de waarde', () => {
    expect(insertAtCursor('x', 0, 0, 'y')).toEqual({ value: 'yx', caret: 1 })
    expect(insertAtCursor('x', 1, 1, 'y')).toEqual({ value: 'xy', caret: 2 })
  })

  it('vervangt een selectie door de ingevoegde tekst', () => {
    expect(insertAtCursor('abc', 0, 2, 'x')).toEqual({ value: 'xc', caret: 1 })
  })

  it('vervangt de hele waarde als alles geselecteerd is', () => {
    expect(insertAtCursor('2x+1', 0, 4, 'y')).toEqual({ value: 'y', caret: 1 })
  })

  it('werkt op een lege invoer', () => {
    expect(insertAtCursor('', 0, 0, 'pi')).toEqual({ value: 'pi', caret: 2 })
  })

  it('zet de cursor op de |-markering van de wiskundeknoppen', () => {
    expect(insertAtCursor('', 0, 0, '^(|)')).toEqual({ value: '^()', caret: 2 })
    expect(insertAtCursor('', 0, 0, 'sqrt(|)')).toEqual({ value: 'sqrt()', caret: 5 })
    expect(insertAtCursor('', 0, 0, '(|)/()')).toEqual({ value: '()/()', caret: 1 })
  })

  it('plaatst de |-markering middenin bestaande tekst', () => {
    // leerling staat met de cursor na "2x" in "2x+1" en drukt op de √-knop
    expect(insertAtCursor('2x+1', 2, 2, 'sqrt(|)')).toEqual({
      value: '2xsqrt()+1',
      caret: 7,
    })
  })

  it('verwijdert een selectie en zet de cursor op de |-markering', () => {
    // "2x" is geselecteerd in "2x+1" en de leerling drukt op de macht-knop
    expect(insertAtCursor('2x+1', 0, 2, '^(|)')).toEqual({
      value: '^()+1',
      caret: 2,
    })
  })

  it('gebruikt alleen het eerste |-teken als marker', () => {
    expect(insertAtCursor('', 0, 0, 'a|b|c')).toEqual({ value: 'ab|c', caret: 1 })
  })
})
