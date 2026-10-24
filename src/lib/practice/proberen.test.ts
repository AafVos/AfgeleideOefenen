import { describe, expect, it } from 'vitest'

import {
  kiesDrieProefopgaven,
  leesProefSelectie,
  oefenenVanProberen,
  proberenVanOefenen,
  uitspraakProef,
} from './proberen'

describe('leesProefSelectie', () => {
  it('leest hoofdstuk, onderwerp en soort', () => {
    expect(
      leesProefSelectie({
        chapter: 'h2',
        topic: 'h2_termsgewijs',
        cluster: 'polynoom_differentieren',
      }),
    ).toEqual({
      chapter: 'h2',
      topic: 'h2_termsgewijs',
      cluster: 'polynoom_differentieren',
    })
  })

  it('laat een leeg onderwerp weg', () => {
    expect(leesProefSelectie({ chapter: ' e2e ', topic: '  ', cluster: '' })).toEqual({
      chapter: 'e2e',
      topic: null,
      cluster: null,
    })
  })

  it('weigert een adres zonder hoofdstuk of met rare tekens', () => {
    expect(leesProefSelectie({ chapter: '' })).toBeNull()
    expect(leesProefSelectie({ chapter: '../geheim' })).toBeNull()
    expect(leesProefSelectie({ chapter: 'h2', topic: 'twee woorden' })).toBeNull()
  })
})

describe('proberenVanOefenen', () => {
  it('maakt van de oefenlink een proeflink en behoudt van= voor de bronmeting', () => {
    expect(
      proberenVanOefenen(
        '/oefenen?chapter=h6&topic=h6_machten&cluster=wortelvorm&van=voorbeeld',
      ),
    ).toBe('/proberen?chapter=h6&topic=h6_machten&cluster=wortelvorm&van=voorbeeld')
  })

  it('laat een oefenlink zonder van= ongemoeid', () => {
    expect(proberenVanOefenen('/oefenen?chapter=h2')).toBe('/proberen?chapter=h2')
  })
})

describe('oefenenVanProberen', () => {
  it('bouwt de oefenlink met hoofdstuk, onderwerp en soort', () => {
    expect(
      oefenenVanProberen({ chapter: 'h2', topic: 'h2_termsgewijs', cluster: 'rij' }),
    ).toBe('/oefenen?chapter=h2&topic=h2_termsgewijs&cluster=rij')
  })

  it('laat een ontbrekend onderwerp of soort weg', () => {
    expect(oefenenVanProberen({ chapter: 'h2', topic: null, cluster: null })).toBe(
      '/oefenen?chapter=h2',
    )
  })
})

describe('kiesDrieProefopgaven', () => {
  it('pakt de drie makkelijkste, stabiel op volgorde', () => {
    const gekozen = kiesDrieProefopgaven([
      { id: 'c', difficulty: 2, order_index: 1 },
      { id: 'b', difficulty: 1, order_index: 2 },
      { id: 'a', difficulty: 1, order_index: 1 },
      { id: 'd', difficulty: 1, order_index: 3 },
      { id: 'e', difficulty: 3, order_index: 1 },
    ])
    expect(gekozen.map((rij) => rij.id)).toEqual(['a', 'b', 'd'])
  })
})

describe('uitspraakProef', () => {
  it('keurt het vaste antwoord en een andere schrijfwijze goed', () => {
    expect(uitspraakProef('2x', '2x', [], false)).toBe('goed')
    expect(uitspraakProef('2X', '2x', [], false)).toBe('goed')
    expect(uitspraakProef('-1/x^2', '-x^-2', ['-1/x^2'], false)).toBe('goed')
  })

  it('houdt een leeg of fout antwoord tegen', () => {
    expect(uitspraakProef('   ', '2x', [], false)).toBe('leeg')
    expect(uitspraakProef('3x', '2x', [], false)).toBe('fout')
    expect(uitspraakProef('onzin', '2x', [], false)).toBe('fout')
  })

  it('vraagt de uitwerking op zonder te kijken of het antwoord klopt', () => {
    expect(uitspraakProef('', '2x', [], true)).toBe('overgeslagen')
    expect(uitspraakProef('fout', '2x', [], true)).toBe('overgeslagen')
  })
})
