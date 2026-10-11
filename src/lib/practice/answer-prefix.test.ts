import { describe, expect, it } from 'vitest'

import { answerPrefix } from './answer-prefix'

describe('answerPrefix', () => {
  it('toont het opgeslagen voorvoegsel, bijvoorbeeld t =', () => {
    expect(answerPrefix('s(t) = 3t^2', 't =')).toBe('t =')
  })

  it('haalt dollartekens weg zodat de formule goed tekent', () => {
    expect(answerPrefix(null, '$t =$')).toBe('t =')
  })

  it('valt terug op f\'(x) = als het veld leeg is', () => {
    expect(answerPrefix('f(x) = 4x^{3}', null)).toBe("f'(x) =")
    expect(answerPrefix('f(x) = 4x^{3}', '   ')).toBe("f'(x) =")
    expect(answerPrefix('f(x) = 4x^{3}', '$$')).toBe("f'(x) =")
  })

  it('leest de letter uit een kale som', () => {
    expect(answerPrefix('k(x) = x^2', null)).toBe("k'(x) =")
    expect(answerPrefix('geen formule', null)).toBe("f'(x) =")
  })

  it('laat een verhaaltje zonder voorvoegsel op f\'(x) = staan', () => {
    expect(
      answerPrefix('De temperatuur is $T(t) = 3t^{2}$ na $t$ uur.', null),
    ).toBe("f'(x) =")
  })
})
