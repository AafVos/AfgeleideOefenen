import { afterEach, describe, expect, it } from 'vitest'

import { BEWAARDE_PARAMETERS, schoonPad } from './gebeurtenis'
import {
  METEN_PARAMETER,
  METEN_UIT_SLEUTEL,
  metenUitgeschakeld,
  pikMetenSchakelaarUitAdres,
  schakelaarUitZoekreeks,
  zetMetenAan,
  zetMetenUit,
  type Bewaarplek,
} from './schakelaar'

/** Een `localStorage` van niks, zodat dit zonder browser te testen is. */
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

describe('schakelaarUitZoekreeks', () => {
  it('pikt "uit" op en haalt de parameter weg', () => {
    expect(schakelaarUitZoekreeks('?meten=uit')).toEqual({ actie: 'uit', zoek: '' })
  })

  it('pikt "aan" op en haalt de parameter weg', () => {
    expect(schakelaarUitZoekreeks('?meten=aan')).toEqual({ actie: 'aan', zoek: '' })
  })

  it('laat de andere parameters staan', () => {
    expect(schakelaarUitZoekreeks('?chapter=h2&meten=uit&topic=h2_machtsregel')).toEqual({
      actie: 'uit',
      zoek: '?chapter=h2&topic=h2_machtsregel',
    })
  })

  it('haalt onbekende inhoud ook weg, maar meldt geen actie', () => {
    expect(schakelaarUitZoekreeks('?meten=iets-verzonnens')).toEqual({
      actie: null,
      zoek: '',
    })
  })

  it('laat een adres zonder die parameter met rust', () => {
    expect(schakelaarUitZoekreeks('?chapter=h2')).toEqual({ actie: null, zoek: '?chapter=h2' })
    expect(schakelaarUitZoekreeks('')).toEqual({ actie: null, zoek: '' })
  })
})

describe('de vlag in localStorage', () => {
  it('staat er niet in een lege opslag', () => {
    expect(metenUitgeschakeld(nepOpslag())).toBe(false)
  })

  it('zetMetenUit zet hem erin', () => {
    const opslag = nepOpslag()
    zetMetenUit(opslag)

    expect(opslag.getItem(METEN_UIT_SLEUTEL)).not.toBe(null)
    expect(metenUitgeschakeld(opslag)).toBe(true)
  })

  it('zetMetenAan haalt hem eraf', () => {
    const opslag = nepOpslag({ [METEN_UIT_SLEUTEL]: '1' })
    zetMetenAan(opslag)

    expect(metenUitgeschakeld(opslag)).toBe(false)
  })
})

describe('pikMetenSchakelaarUitAdres', () => {
  const echtWindow = (globalThis as Record<string, unknown>).window

  function nepVenster(zoek: string, lokaleOpslag = new Map<string, string>()) {
    const location = { pathname: '/nl', search: zoek, hash: '' }
    const venster = {
      location,
      history: {
        state: null,
        replaceState: (_staat: unknown, _titel: string, adres: string) => {
          const [pad, rest] = adres.split('?')
          location.pathname = pad
          location.search = rest ? `?${rest}` : ''
        },
      },
      localStorage: {
        getItem: (sleutel: string) => lokaleOpslag.get(sleutel) ?? null,
        setItem: (sleutel: string, waarde: string) => void lokaleOpslag.set(sleutel, waarde),
        removeItem: (sleutel: string) => void lokaleOpslag.delete(sleutel),
      },
      lokaleOpslag,
    }
    return venster
  }

  function zetNeer(venster: ReturnType<typeof nepVenster>) {
    Object.defineProperty(globalThis, 'window', {
      value: venster,
      configurable: true,
      writable: true,
    })
  }

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', {
      value: echtWindow,
      configurable: true,
      writable: true,
    })
  })

  it('zet de vlag bij ?meten=uit en haalt de parameter weg', () => {
    const venster = nepVenster('?meten=uit')
    zetNeer(venster)

    expect(pikMetenSchakelaarUitAdres()).toBe('uit')
    expect(venster.location.search).toBe('')
    expect(venster.lokaleOpslag.has(METEN_UIT_SLEUTEL)).toBe(true)
  })

  it('laat de andere parameters in de adresregel staan', () => {
    const venster = nepVenster('?chapter=h2&meten=uit')
    zetNeer(venster)

    pikMetenSchakelaarUitAdres()

    expect(venster.location.search).toBe('?chapter=h2')
  })

  it('haalt de vlag weg bij ?meten=aan', () => {
    const venster = nepVenster('?meten=aan', new Map([[METEN_UIT_SLEUTEL, '1']]))
    zetNeer(venster)

    expect(pikMetenSchakelaarUitAdres()).toBe('aan')
    expect(venster.lokaleOpslag.has(METEN_UIT_SLEUTEL)).toBe(false)
  })

  it('doet niets zonder de parameter', () => {
    const venster = nepVenster('?chapter=h2')
    zetNeer(venster)

    expect(pikMetenSchakelaarUitAdres()).toBe(null)
    expect(venster.location.search).toBe('?chapter=h2')
    expect(venster.lokaleOpslag.size).toBe(0)
  })
})

describe('METEN_PARAMETER', () => {
  it('komt niet in het gemeten pad terecht', () => {
    expect(BEWAARDE_PARAMETERS).not.toContain(METEN_PARAMETER)
    expect(schoonPad('/nl/dashboard', `?${METEN_PARAMETER}=uit`)).toBe('/nl/dashboard')
  })
})
