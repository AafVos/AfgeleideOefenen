import { describe, expect, it } from 'vitest'

import { BEWAARDE_PARAMETERS, schoonPad } from './gebeurtenis'
import {
  bewaarRegistratie,
  doelVanBewaard,
  pakRegistratie,
  REGISTRATIE_GETELD,
  REGISTRATIE_PARAMETER,
  REGISTRATIE_PLEK,
  registratieDoel,
  registratieUitZoekreeks,
  ZONDER_DOEL,
  type Bewaarplek,
} from './melden'

/** Een `sessionStorage` van niks, zodat dit zonder browser te testen is. */
function nepOpslag(begin: Record<string, string> = {}): Bewaarplek & {
  inhoud: Map<string, string>
} {
  const inhoud = new Map(Object.entries(begin))
  return {
    inhoud,
    getItem: (sleutel) => inhoud.get(sleutel) ?? null,
    setItem: (sleutel, waarde) => void inhoud.set(sleutel, waarde),
    removeItem: (sleutel) => void inhoud.delete(sleutel),
  }
}

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

describe('een aanmelding opzij zetten en ophalen', () => {
  it('bewaart de aanmelding tot het meetscriptje erom vraagt', () => {
    const opslag = nepOpslag()
    bewaarRegistratie(opslag, 'registratie-via-google')

    expect(opslag.getItem(REGISTRATIE_PLEK)).toBe('registratie-via-google')
    expect(doelVanBewaard(pakRegistratie(opslag))).toBe('registratie-via-google')
  })

  it('geeft hem maar één keer af', () => {
    const opslag = nepOpslag()
    bewaarRegistratie(opslag, 'registratie-via-google')

    expect(pakRegistratie(opslag)).toBe('registratie-via-google')
    expect(pakRegistratie(opslag)).toBe(null)
    expect(pakRegistratie(opslag)).toBe(null)
  })

  it('telt na een herlaadactie geen tweede aanmelding', () => {
    const opslag = nepOpslag()
    bewaarRegistratie(opslag, 'registratie-via-google')
    pakRegistratie(opslag)

    // De leerling laadt dezelfde pagina opnieuw en de parameter komt weer
    // langs. Dit tabblad heeft er al een geteld, dus er gebeurt niets.
    bewaarRegistratie(opslag, 'registratie-via-google')
    expect(opslag.getItem(REGISTRATIE_PLEK)).toBe(null)
    expect(pakRegistratie(opslag)).toBe(null)
  })

  it('kan ook een aanmelding zonder herkomst aan', () => {
    const opslag = nepOpslag()
    bewaarRegistratie(opslag, null)

    expect(opslag.getItem(REGISTRATIE_PLEK)).toBe(ZONDER_DOEL)
    const bewaard = pakRegistratie(opslag)
    // Er staat wél een aanmelding klaar, maar zonder doel voor in de tabel.
    expect(bewaard).not.toBe(null)
    expect(doelVanBewaard(bewaard)).toBe(null)
  })

  it('zegt niets als er niets klaarstaat', () => {
    expect(pakRegistratie(nepOpslag())).toBe(null)
    expect(doelVanBewaard(null)).toBe(null)
  })

  it('zet het merkteken neer zodra er geteld is', () => {
    const opslag = nepOpslag()
    bewaarRegistratie(opslag, 'registratie-via-google')
    expect(opslag.getItem(REGISTRATIE_GETELD)).toBe(null)

    pakRegistratie(opslag)
    expect(opslag.getItem(REGISTRATIE_GETELD)).toBe('1')
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
