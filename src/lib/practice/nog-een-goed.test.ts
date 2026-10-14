import { describe, expect, it } from 'vitest'

import { nogEenGoedZin } from './nog-een-goed'

describe('nogEenGoedZin', () => {
  it('toont de zin alleen bij een reeks van twee', () => {
    expect(nogEenGoedZin(2, 'kettingregel')).toBe(
      'Nog één goed, dan beheers je kettingregel.',
    )
  })

  it('toont niets bij een reeks van 0, 1 of 3', () => {
    expect(nogEenGoedZin(0, 'kettingregel')).toBeNull()
    expect(nogEenGoedZin(1, 'kettingregel')).toBeNull()
    expect(nogEenGoedZin(3, 'kettingregel')).toBeNull()
  })

  it('toont niets zonder naam', () => {
    expect(nogEenGoedZin(2, '  ')).toBeNull()
  })
})
