import { describe, expect, it } from 'vitest'

import { BEWAARDE_PARAMETERS, schoonPad } from './gebeurtenis'
import {
  REGISTRATIE_PARAMETER,
  registratieDoel,
  registratieUitZoekreeks,
} from './melden'

describe('registratieDoel', () => {
  it('vertaalt een bekende manier van aanmelden', () => {
    expect(registratieDoel('google')).toBe('registratie-via-google')
  })

  it('laat onbekende inhoud niet door', () => {
    expect(registratieDoel(null)).toBe(null)
    expect(registratieDoel('')).toBe(null)
    expect(registratieDoel('iets-verzonnens')).toBe(null)
  })
})

describe('registratieUitZoekreeks', () => {
  it('pikt de aanmelding op en haalt de parameter weg', () => {
    expect(registratieUitZoekreeks('?nieuw=google')).toEqual({
      gevonden: true,
      doel: 'registratie-via-google',
      zoek: '',
    })
  })

  it('laat de andere parameters staan', () => {
    expect(registratieUitZoekreeks('?chapter=h2&nieuw=google&topic=h2_machtsregel')).toEqual(
      {
        gevonden: true,
        doel: 'registratie-via-google',
        zoek: '?chapter=h2&topic=h2_machtsregel',
      },
    )
  })

  it('haalt onbekende inhoud ook weg, maar meldt niets', () => {
    expect(registratieUitZoekreeks('?nieuw=iets-verzonnens')).toEqual({
      gevonden: true,
      doel: null,
      zoek: '',
    })
  })

  it('laat een adres zonder die parameter met rust', () => {
    expect(registratieUitZoekreeks('?chapter=h2')).toEqual({
      gevonden: false,
      doel: null,
      zoek: '?chapter=h2',
    })
    expect(registratieUitZoekreeks('')).toEqual({ gevonden: false, doel: null, zoek: '' })
  })
})

describe('REGISTRATIE_PARAMETER', () => {
  it('komt niet in het gemeten pad terecht', () => {
    expect(BEWAARDE_PARAMETERS).not.toContain(REGISTRATIE_PARAMETER)
    expect(schoonPad('/nl/dashboard', `?${REGISTRATIE_PARAMETER}=google`)).toBe(
      '/nl/dashboard',
    )
  })
})
