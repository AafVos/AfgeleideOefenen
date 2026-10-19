import { describe, expect, it } from 'vitest'

import { netBeheerst, nogEenGoedZin } from './nog-een-goed'

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

describe('netBeheerst', () => {
  it('is waar precies op de drempel, bij mastered', () => {
    expect(netBeheerst(3, true)).toBe(true)
  })

  it('is onwaar vóór de drempel, ook als mastered al true zou zijn', () => {
    expect(netBeheerst(2, true)).toBe(false)
    expect(netBeheerst(1, true)).toBe(false)
  })

  it('is onwaar ná de drempel: dat is geen nieuw moment meer', () => {
    expect(netBeheerst(4, true)).toBe(false)
    expect(netBeheerst(7, true)).toBe(false)
  })

  it('is onwaar zonder mastered, ook bij een reeks van drie', () => {
    expect(netBeheerst(3, false)).toBe(false)
  })
})
