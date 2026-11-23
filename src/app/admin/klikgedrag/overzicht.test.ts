import { describe, expect, it } from 'vitest'

import {
  bouwBezoeken,
  duurTekst,
  eindpaginas,
  herkomstVan,
  padZonderZoek,
  procent,
  telKlikken,
  trechter,
  type KlikRij,
} from './overzicht'

// =====================================================================
// De beheerpagina Klikgedrag maakt van losse gebeurtenissen bezoeken.
// Hier staat vast hoe: de volgorde binnen een tabblad, waar een bezoek
// eindigt, de trechter, en dat Aaf zelf herkenbaar blijft.
// =====================================================================

let teller = 0

/** Een rij met redelijke standaardwaarden; alleen wat ertoe doet geef je mee. */
function rij(deel: Partial<KlikRij> & Pick<KlikRij, 'sessie_id' | 'soort' | 'pad'>): KlikRij {
  teller++
  return {
    tijdstip: `2026-11-20T10:00:${String(teller % 60).padStart(2, '0')}.000Z`,
    volgnummer: teller,
    doel: null,
    waarde: null,
    apparaat: 'telefoon',
    verwijzer: null,
    ingelogd: false,
    ...deel,
  }
}

describe('bouwBezoeken', () => {
  it('zet de stappen op volgnummer, ook als de tijden gelijk zijn', () => {
    // Eén zending krijgt in de database hetzelfde tijdstip; het volgnummer
    // bepaalt dan de volgorde.
    const tijd = '2026-11-20T10:00:00.000Z'
    const [bezoek] = bouwBezoeken([
      rij({ sessie_id: 'a', soort: 'klik', pad: '/nl', doel: 'start-registreren', tijdstip: tijd, volgnummer: 2 }),
      rij({ sessie_id: 'a', soort: 'pagina', pad: '/nl/registreren', tijdstip: tijd, volgnummer: 3 }),
      rij({ sessie_id: 'a', soort: 'pagina', pad: '/nl', tijdstip: tijd, volgnummer: 1 }),
    ])
    expect(bezoek.stappen.map((s) => s.doel ?? s.pad)).toEqual([
      '/nl',
      'start-registreren',
      '/nl/registreren',
    ])
    expect(bezoek.laatstePagina).toBe('/nl/registreren')
  })

  it('hangt scrollen aan de pagina waar iemand op dat moment is', () => {
    const [bezoek] = bouwBezoeken([
      rij({ sessie_id: 'a', soort: 'pagina', pad: '/nl' }),
      rij({ sessie_id: 'a', soort: 'scroll', pad: '/nl', waarde: 25 }),
      rij({ sessie_id: 'a', soort: 'scroll', pad: '/nl', waarde: 50 }),
      rij({ sessie_id: 'a', soort: 'pagina', pad: '/nl/theorie' }),
    ])
    expect(bezoek.stappen).toHaveLength(2)
    expect(bezoek.stappen[0].scroll).toBe(50)
    expect(bezoek.stappen[1].scroll).toBeNull()
  })

  it('noemt een bezoek met één pagina en geen klik "meteen weg"', () => {
    const bezoeken = bouwBezoeken([
      rij({ sessie_id: 'weg', soort: 'pagina', pad: '/nl' }),
      rij({ sessie_id: 'weg', soort: 'scroll', pad: '/nl', waarde: 25 }),
      rij({ sessie_id: 'bleef', soort: 'pagina', pad: '/nl' }),
      rij({ sessie_id: 'bleef', soort: 'klik', pad: '/nl', doel: 'start-onderwerp' }),
    ])
    const perId = Object.fromEntries(bezoeken.map((b) => [b.sessieId, b]))
    expect(perId.weg.meteenWeg).toBe(true)
    expect(perId.bleef.meteenWeg).toBe(false)
  })

  it('herkent Aaf aan de klik op menu-admin', () => {
    const [bezoek] = bouwBezoeken([
      rij({ sessie_id: 'aaf', soort: 'pagina', pad: '/nl', ingelogd: true }),
      rij({ sessie_id: 'aaf', soort: 'klik', pad: '/nl', doel: 'menu-admin', ingelogd: true }),
    ])
    expect(bezoek.beheerder).toBe(true)
  })

  it('zet het nieuwste bezoek bovenaan', () => {
    const bezoeken = bouwBezoeken([
      rij({ sessie_id: 'oud', soort: 'pagina', pad: '/nl', tijdstip: '2026-11-19T09:00:00.000Z' }),
      rij({ sessie_id: 'nieuw', soort: 'pagina', pad: '/nl', tijdstip: '2026-11-20T09:00:00.000Z' }),
    ])
    expect(bezoeken.map((b) => b.sessieId)).toEqual(['nieuw', 'oud'])
  })

  it('rekent de duur van eerste tot laatste gebeurtenis', () => {
    const [bezoek] = bouwBezoeken([
      rij({ sessie_id: 'a', soort: 'pagina', pad: '/nl', tijdstip: '2026-11-20T10:00:00.000Z', volgnummer: 1 }),
      rij({ sessie_id: 'a', soort: 'klik', pad: '/nl', doel: 'x', tijdstip: '2026-11-20T10:02:10.000Z', volgnummer: 2 }),
    ])
    expect(bezoek.duurSeconden).toBe(130)
  })

  it('telt dode klikken, woedeklikken en fouten als problemen', () => {
    const [bezoek] = bouwBezoeken([
      rij({ sessie_id: 'a', soort: 'pagina', pad: '/nl' }),
      rij({ sessie_id: 'a', soort: 'dode_klik', pad: '/nl', doel: 'div' }),
      rij({ sessie_id: 'a', soort: 'woedeklik', pad: '/nl', doel: 'button:Nakijken' }),
      rij({ sessie_id: 'a', soort: 'fout', pad: '/nl/weg' }),
    ])
    expect(bezoek.problemen).toBe(3)
  })
})

describe('herkomstVan', () => {
  it('laat van= voorgaan op de verwijzer', () => {
    expect(
      herkomstVan([
        rij({ sessie_id: 'a', soort: 'pagina', pad: '/nl/voorbeeld/ln-x?van=youtube', verwijzer: 'youtube.com' }),
      ]),
    ).toBe('van=youtube')
  })

  it('gebruikt utm_source als er geen van= is', () => {
    expect(
      herkomstVan([rij({ sessie_id: 'a', soort: 'pagina', pad: '/nl?utm_source=chatgpt.com' })]),
    ).toBe('chatgpt.com')
  })

  it('valt terug op de verwijzer, en anders op direct', () => {
    expect(
      herkomstVan([rij({ sessie_id: 'a', soort: 'pagina', pad: '/nl', verwijzer: 'google.com' })]),
    ).toBe('google.com')
    expect(herkomstVan([rij({ sessie_id: 'a', soort: 'pagina', pad: '/nl' })])).toBe('direct')
  })
})

describe('trechter', () => {
  it('telt alleen wie niet ingelogd binnenkwam', () => {
    const bezoeken = bouwBezoeken([
      // Nieuwe bezoeker die de hele weg aflegt.
      rij({ sessie_id: 'nieuw', soort: 'pagina', pad: '/nl' }),
      rij({ sessie_id: 'nieuw', soort: 'klik', pad: '/nl', doel: 'home-proefsom-nakijken' }),
      rij({ sessie_id: 'nieuw', soort: 'pagina', pad: '/nl/registreren' }),
      rij({ sessie_id: 'nieuw', soort: 'registratie', pad: '/nl/registreren' }),
      rij({ sessie_id: 'nieuw', soort: 'klik', pad: '/nl/oefenen', doel: 'oefenen-nakijken', ingelogd: true }),
      // Nieuwe bezoeker die na de proefsom op /proberen afhaakt.
      rij({ sessie_id: 'proef', soort: 'pagina', pad: '/nl/proberen' }),
      // Leerling die al ingelogd was: telt niet mee.
      rij({ sessie_id: 'leerling', soort: 'pagina', pad: '/nl/oefenen', ingelogd: true }),
      rij({ sessie_id: 'leerling', soort: 'klik', pad: '/nl/oefenen', doel: 'oefenen-nakijken', ingelogd: true }),
    ])
    expect(trechter(bezoeken).map((r) => r.aantal)).toEqual([2, 2, 1, 1, 1])
  })

  it('telt de knop Nakijken op de startpagina als proefsom, maar niet elders', () => {
    const bezoeken = bouwBezoeken([
      rij({ sessie_id: 'start', soort: 'klik', pad: '/nl', doel: 'button:Nakijken' }),
      rij({ sessie_id: 'elders', soort: 'klik', pad: '/nl/theorie', doel: 'button:Nakijken' }),
    ])
    expect(trechter(bezoeken)[1].aantal).toBe(1)
  })
})

describe('eindpaginas', () => {
  it('telt per pagina hoe vaak een bezoek daar eindigde en hoe vaak hij bezocht werd', () => {
    const bezoeken = bouwBezoeken([
      rij({ sessie_id: 'a', soort: 'pagina', pad: '/nl' }),
      rij({ sessie_id: 'a', soort: 'pagina', pad: '/nl/registreren' }),
      rij({ sessie_id: 'b', soort: 'pagina', pad: '/nl' }),
      rij({ sessie_id: 'b', soort: 'pagina', pad: '/nl/registreren?van=youtube' }),
      rij({ sessie_id: 'c', soort: 'pagina', pad: '/nl' }),
    ])
    expect(eindpaginas(bezoeken)).toEqual([
      { pad: '/nl/registreren', bezocht: 2, eindigdeHier: 2 },
      { pad: '/nl', bezocht: 3, eindigdeHier: 1 },
    ])
  })
})

describe('telKlikken', () => {
  it('telt keer en bezoeken, en splitst desgewenst per pagina', () => {
    const bezoeken = bouwBezoeken([
      rij({ sessie_id: 'a', soort: 'dode_klik', pad: '/nl', doel: 'div' }),
      rij({ sessie_id: 'a', soort: 'dode_klik', pad: '/nl', doel: 'div' }),
      rij({ sessie_id: 'b', soort: 'dode_klik', pad: '/nl/theorie', doel: 'div' }),
      rij({ sessie_id: 'b', soort: 'klik', pad: '/nl', doel: 'start-onderwerp' }),
    ])
    expect(telKlikken(bezoeken, ['dode_klik'])).toEqual([
      { doel: 'div', pad: null, keer: 3, bezoeken: 2 },
    ])
    expect(telKlikken(bezoeken, ['dode_klik'], { perPagina: true })).toEqual([
      { doel: 'div', pad: '/nl', keer: 2, bezoeken: 1 },
      { doel: 'div', pad: '/nl/theorie', keer: 1, bezoeken: 1 },
    ])
  })
})

describe('kleine hulpjes', () => {
  it('padZonderZoek haalt de zoekreeks eraf', () => {
    expect(padZonderZoek('/nl/proberen?van=youtube')).toBe('/nl/proberen')
    expect(padZonderZoek('/nl')).toBe('/nl')
  })

  it('duurTekst schrijft seconden, minuten en uren', () => {
    expect(duurTekst(45)).toBe('45 s')
    expect(duurTekst(130)).toBe('2 min 10 s')
    expect(duurTekst(120)).toBe('2 min')
    expect(duurTekst(3900)).toBe('1 u 5 min')
  })

  it('procent geeft een streepje als er niets te delen is', () => {
    expect(procent(1, 4)).toBe('25%')
    expect(procent(0, 0)).toBe('—')
  })
})
