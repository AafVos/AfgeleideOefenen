import { describe, expect, it } from 'vitest'

import {
  apparaatVanBreedte,
  doelNaam,
  geldigeGebeurtenis,
  geldigeZending,
  isBot,
  isWoedeklik,
  korteTekst,
  schoonPad,
  slaPadOver,
  utmBron,
  verwijzerDomein,
  type Klikplek,
} from './gebeurtenis'

const SESSIE = '7a1e0c4e-2b6f-4e2a-9d1e-3f8a5c6b7d20'

function rij(extra: Record<string, unknown> = {}) {
  return {
    sessie_id: SESSIE,
    soort: 'klik',
    pad: '/nl/oefenen',
    doel: 'oefenen-nakijken',
    apparaat: 'telefoon',
    ...extra,
  }
}

describe('schoonPad', () => {
  it('gooit de queryparameters weg', () => {
    expect(schoonPad('/nl/oefenen', '?chapter=h2&topic=machtsregel')).toBe('/nl/oefenen')
  })

  it('houdt alleen van en utm_source over', () => {
    expect(schoonPad('/nl/proberen', '?van=klas&chapter=h2&utm_source=youtube')).toBe(
      '/nl/proberen?van=klas&utm_source=youtube',
    )
  })

  it('haalt een query of anker uit het pad zelf', () => {
    expect(schoonPad('/nl/theorie#hoofdstuk-h6')).toBe('/nl/theorie')
    expect(schoonPad('/nl/theorie?x=1')).toBe('/nl/theorie')
  })
})

describe('apparaatVanBreedte', () => {
  it('kent alleen telefoon, tablet en computer', () => {
    expect(apparaatVanBreedte(390)).toBe('telefoon')
    expect(apparaatVanBreedte(639)).toBe('telefoon')
    expect(apparaatVanBreedte(768)).toBe('tablet')
    expect(apparaatVanBreedte(1280)).toBe('computer')
  })
})

describe('verwijzerDomein', () => {
  it('geeft alleen het domein, niet het hele adres', () => {
    expect(verwijzerDomein('https://www.google.com/search?q=afgeleide', 'afgeleideoefenen.nl')).toBe(
      'google.com',
    )
    expect(verwijzerDomein('https://m.youtube.com/watch?v=abc', 'afgeleideoefenen.nl')).toBe(
      'm.youtube.com',
    )
  })

  it('telt de site zelf niet als verwijzer', () => {
    expect(verwijzerDomein('https://www.afgeleideoefenen.nl/nl', 'afgeleideoefenen.nl')).toBeNull()
    expect(verwijzerDomein('', 'afgeleideoefenen.nl')).toBeNull()
    expect(verwijzerDomein('geen adres', 'afgeleideoefenen.nl')).toBeNull()
  })
})

describe('utmBron', () => {
  it('leest utm_source in kleine letters', () => {
    expect(utmBron('?utm_source=ChatGPT.com')).toBe('chatgpt.com')
  })

  it('geeft null zonder die parameter', () => {
    expect(utmBron('')).toBeNull()
    expect(utmBron('?van=youtube')).toBeNull()
  })
})

describe('isBot', () => {
  it('herkent crawlers en lege user-agents', () => {
    expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true)
    expect(isBot('HeadlessChrome/140.0')).toBe(true)
    expect(isBot(null)).toBe(true)
  })

  it('laat een gewone telefoon door', () => {
    expect(
      isBot(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
      ),
    ).toBe(false)
  })
})

describe('korteTekst', () => {
  it('kort in en haalt dubbele spaties weg', () => {
    expect(korteTekst('  Nakijken\n  nu ')).toBe('Nakijken nu')
    expect(korteTekst('a'.repeat(60))).toBe(`${'a'.repeat(40)}…`)
  })

  it('laat een e-mailadres nooit door', () => {
    expect(korteTekst('leerling@school.nl')).toBeNull()
  })
})

describe('doelNaam', () => {
  it('kiest de vaste naam als die er is', () => {
    expect(doelNaam('oefenen-nakijken', 'BUTTON', 'Nakijken')).toBe('oefenen-nakijken')
  })

  it('valt terug op het soort element plus een korte tekst', () => {
    expect(doelNaam(null, 'A', 'Probeer 3 sommen')).toBe('a:Probeer 3 sommen')
    expect(doelNaam(undefined, 'DIV', null)).toBe('div')
  })
})

describe('isWoedeklik', () => {
  const plek = (t: number, x = 100, y = 100): Klikplek => ({ x, y, t })
  const veldplek = (t: number, x = 100, y = 100): Klikplek => ({
    x,
    y,
    t,
    opTekstveld: true,
  })

  it('telt drie kliks binnen een seconde op dezelfde plek', () => {
    expect(isWoedeklik([plek(0), plek(300), plek(600)])).toBe(true)
  })

  it('telt niet als de kliks te ver uit elkaar liggen', () => {
    expect(isWoedeklik([plek(0), plek(300), plek(600, 400)])).toBe(false)
  })

  it('telt niet als er meer dan een seconde tussen zit', () => {
    expect(isWoedeklik([plek(0), plek(300), plek(1500)])).toBe(false)
  })

  it('telt niet als het dubbel- of trippelklikken op een tekstveld is', () => {
    // Een leerling die een woord selecteert om een typefout te verbeteren,
    // klikt ook drie keer snel op dezelfde plek — maar dat is geen woedeklik.
    expect(isWoedeklik([veldplek(0), veldplek(300), veldplek(600)])).toBe(false)
  })

  it('telt wel als een losse klik op een tekstveld toevallig in de reeks valt', () => {
    expect(isWoedeklik([plek(0), plek(300), veldplek(600)])).toBe(false)
    expect(isWoedeklik([plek(0), plek(300), plek(600), plek(900)])).toBe(true)
  })
})

describe('slaPadOver', () => {
  it('meet niets op beheerpagina’s', () => {
    expect(slaPadOver('/admin')).toBe(true)
    expect(slaPadOver('/admin/opgaven')).toBe(true)
    expect(slaPadOver('/nl/oefenen')).toBe(false)
  })
})

describe('geldigeGebeurtenis', () => {
  it('neemt een gewone rij over', () => {
    expect(geldigeGebeurtenis(rij())).toEqual({
      sessie_id: SESSIE,
      soort: 'klik',
      pad: '/nl/oefenen',
      doel: 'oefenen-nakijken',
      waarde: null,
      apparaat: 'telefoon',
      verwijzer: null,
      utm_source: null,
      ingelogd: false,
    })
  })

  it('bewaart utm_source als het een tekst is', () => {
    expect(geldigeGebeurtenis(rij({ utm_source: 'chatgpt.com' }))?.utm_source).toBe(
      'chatgpt.com',
    )
    expect(geldigeGebeurtenis(rij({ utm_source: '' }))?.utm_source).toBeNull()
  })

  it('weigert een onbekend soort, apparaat of sessie-id', () => {
    expect(geldigeGebeurtenis(rij({ soort: 'toetsaanslag' }))).toBeNull()
    expect(geldigeGebeurtenis(rij({ apparaat: 'horloge' }))).toBeNull()
    expect(geldigeGebeurtenis(rij({ sessie_id: 'leerling-12' }))).toBeNull()
  })

  it('bewaart de scrolldiepte alleen bij scroll, en alleen 25 tot 100', () => {
    expect(geldigeGebeurtenis(rij({ soort: 'scroll', waarde: 50 }))?.waarde).toBe(50)
    expect(geldigeGebeurtenis(rij({ soort: 'scroll', waarde: 63 }))?.waarde).toBeNull()
    expect(geldigeGebeurtenis(rij({ waarde: 50 }))?.waarde).toBeNull()
  })

  it('meet niets op een beheerpagina', () => {
    expect(geldigeGebeurtenis(rij({ pad: '/admin/opgaven' }))).toBeNull()
  })

  it('laat geen e-mailadres in het doel staan', () => {
    expect(geldigeGebeurtenis(rij({ doel: 'a:leerling@school.nl' }))?.doel).toBeNull()
  })
})

describe('geldigeZending', () => {
  it('houdt alleen rijen van hetzelfde tabblad over', () => {
    const ander = '00000000-0000-4000-8000-000000000001'
    const uitslag = geldigeZending([rij(), rij({ sessie_id: ander }), rij({ soort: 'pagina' })])
    expect(uitslag.map((r) => r.soort)).toEqual(['klik', 'pagina'])
  })

  it('stuurt hoogstens veertig rijen door', () => {
    expect(geldigeZending(Array.from({ length: 80 }, () => rij()))).toHaveLength(40)
  })

  it('geeft niets terug bij onzin', () => {
    expect(geldigeZending('hallo')).toEqual([])
    expect(geldigeZending([{ pad: '/nl' }])).toEqual([])
  })
})
