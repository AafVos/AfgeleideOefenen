import { describe, expect, it } from 'vitest'

import {
  bouwLeerlingen,
  isSchuilnaam,
  korteCode,
  korteInvoer,
  perOnderwerp,
  rijenVanLeerling,
  tijdlijn,
  type Antwoord,
  type LeerlingRij,
} from './leerlingen'

// =====================================================================
// Eén leerling volgen zonder naam: welke rijen bij hem horen, hoe klikken
// en antwoorden samen één tijdlijn worden, en waar hij vastliep.
// =====================================================================

const A = 'aaaaaaaaaaaaaaaa'
const B = 'bbbbbbbbbbbbbbbb'

let teller = 0

function rij(deel: Partial<LeerlingRij> & Pick<LeerlingRij, 'sessie_id' | 'soort' | 'pad'>): LeerlingRij {
  teller++
  return {
    tijdstip: '2026-11-20T10:00:00.000Z',
    volgnummer: teller,
    doel: null,
    waarde: null,
    apparaat: 'telefoon',
    verwijzer: null,
    ingelogd: false,
    schuilnaam: null,
    site: 'afgeleide',
    ...deel,
  }
}

function antwoord(deel: Partial<Antwoord> & Pick<Antwoord, 'tijdstip'>): Antwoord {
  return {
    schuilnaam: A,
    goed: true,
    hints: 0,
    invoer: null,
    onderwerp: 'Kettingregel',
    soortSom: null,
    ...deel,
  }
}

describe('rijenVanLeerling', () => {
  it('neemt het hele tabblad mee, ook wat er vóór het inloggen gebeurde', () => {
    const rijen = [
      rij({ sessie_id: 's1', soort: 'pagina', pad: '/nl/proberen' }),
      rij({ sessie_id: 's1', soort: 'registratie', pad: '/nl/registreren' }),
      rij({ sessie_id: 's1', soort: 'pagina', pad: '/nl/oefenen', ingelogd: true, schuilnaam: A }),
      rij({ sessie_id: 's2', soort: 'pagina', pad: '/nl', schuilnaam: B, ingelogd: true }),
      rij({ sessie_id: 's3', soort: 'pagina', pad: '/nl' }),
    ]
    expect(rijenVanLeerling(rijen, A).map((r) => r.pad)).toEqual([
      '/nl/proberen',
      '/nl/registreren',
      '/nl/oefenen',
    ])
  })
})

describe('bouwLeerlingen', () => {
  it('telt dagen, bezoeken en antwoorden per leerling', () => {
    const rijen = [
      rij({ sessie_id: 's1', soort: 'pagina', pad: '/nl/oefenen', schuilnaam: A, tijdstip: '2026-11-20T09:00:00.000Z' }),
      rij({ sessie_id: 's2', soort: 'pagina', pad: '/nl/theorie', schuilnaam: A, tijdstip: '2026-11-22T09:00:00.000Z', apparaat: 'computer' }),
      rij({ sessie_id: 's3', soort: 'pagina', pad: '/nl', schuilnaam: B, tijdstip: '2026-11-21T09:00:00.000Z', site: 'wiskundemetaaf' }),
    ]
    const antwoorden = [
      antwoord({ tijdstip: '2026-11-20T09:05:00.000Z', goed: false }),
      antwoord({ tijdstip: '2026-11-20T09:06:00.000Z', goed: true }),
    ]
    const [eerste, tweede] = bouwLeerlingen(rijen, antwoorden)

    expect(eerste.schuilnaam).toBe(A)
    expect(eerste.dagenActief).toBe(2)
    expect(eerste.bezoeken).toBe(2)
    expect(eerste.antwoorden).toBe(2)
    expect(eerste.goed).toBe(1)
    expect(eerste.apparaten.sort()).toEqual(['computer', 'telefoon'])
    expect(eerste.laatsteOnderwerp).toBe('Kettingregel')

    expect(tweede.schuilnaam).toBe(B)
    expect(tweede.sites).toEqual(['wiskundemetaaf'])
    expect(tweede.antwoorden).toBe(0)
  })

  it('kent ook een leerling die alleen oefende en geen gemeten klik heeft', () => {
    const [leerling] = bouwLeerlingen([], [antwoord({ tijdstip: '2026-11-20T09:05:00.000Z' })])
    expect(leerling.bezoeken).toBe(0)
    expect(leerling.antwoorden).toBe(1)
  })

  it('herkent een nieuwe leerling aan de registratie', () => {
    const rijen = [
      rij({ sessie_id: 's1', soort: 'registratie', pad: '/nl/registreren' }),
      rij({ sessie_id: 's1', soort: 'pagina', pad: '/nl/oefenen', schuilnaam: A, ingelogd: true }),
    ]
    expect(bouwLeerlingen(rijen, [])[0].nieuw).toBe(true)
  })
})

describe('tijdlijn', () => {
  it('zet bezoeken, klikken en antwoorden op tijd, per dag', () => {
    const rijen = [
      rij({ sessie_id: 's1', soort: 'pagina', pad: '/nl/oefenen', schuilnaam: A, tijdstip: '2026-11-20T09:00:00.000Z' }),
      rij({ sessie_id: 's1', soort: 'klik', pad: '/nl/oefenen', doel: 'oefenen-nakijken', schuilnaam: A, tijdstip: '2026-11-20T09:01:00.000Z' }),
      rij({ sessie_id: 's2', soort: 'pagina', pad: '/nl/theorie', schuilnaam: A, tijdstip: '2026-11-22T18:00:00.000Z' }),
    ]
    const dagen = tijdlijn(rijen, [antwoord({ tijdstip: '2026-11-20T09:01:01.000Z', goed: false })])

    expect(dagen.map((d) => d.dag)).toEqual(['2026-11-20', '2026-11-22'])
    // Het antwoord komt een seconde na de laatste gemeten klik, maar hoort
    // nog bij hetzelfde bezoek: het einde staat erna.
    expect(dagen[0].regels.map((r) => r.soort)).toEqual(['bezoek', 'stap', 'stap', 'antwoord', 'einde'])
    expect(dagen[0].antwoorden).toBe(1)
    expect(dagen[0].goed).toBe(0)
    expect(dagen[1].regels.map((r) => r.soort)).toEqual(['bezoek', 'stap', 'einde'])
  })

  it('rekent de dag in Nederlandse tijd', () => {
    // 23:30 UTC op 20 november is al 21 november in Nederland.
    const dagen = tijdlijn([], [antwoord({ tijdstip: '2026-11-20T23:30:00.000Z' })])
    expect(dagen[0].dag).toBe('2026-11-21')
  })
})

describe('perOnderwerp', () => {
  it('vindt de langste reeks foute antwoorden', () => {
    const regels = perOnderwerp([
      antwoord({ tijdstip: '2026-11-20T09:01:00.000Z', goed: false }),
      antwoord({ tijdstip: '2026-11-20T09:02:00.000Z', goed: false }),
      antwoord({ tijdstip: '2026-11-20T09:03:00.000Z', goed: true }),
      antwoord({ tijdstip: '2026-11-20T09:04:00.000Z', goed: false }),
      antwoord({ tijdstip: '2026-11-20T09:05:00.000Z', onderwerp: 'Productregel' }),
    ])
    expect(regels).toEqual([
      { onderwerp: 'Kettingregel', antwoorden: 4, goed: 1, langsteFoutreeks: 2 },
      { onderwerp: 'Productregel', antwoorden: 1, goed: 1, langsteFoutreeks: 0 },
    ])
  })
})

describe('kleine hulpjes', () => {
  it('korteCode toont de eerste zes tekens', () => {
    expect(korteCode('7f3a2c9d00112233')).toBe('7F3A2C')
  })

  it('isSchuilnaam laat alleen 16 hex-tekens door', () => {
    expect(isSchuilnaam('7f3a2c9d00112233')).toBe(true)
    expect(isSchuilnaam('7F3A2C9D00112233')).toBe(false)
    expect(isSchuilnaam('../../etc')).toBe(false)
    expect(isSchuilnaam(undefined)).toBe(false)
  })

  it('korteInvoer kort lange antwoorden in', () => {
    expect(korteInvoer('  3x^2  ')).toBe('3x^2')
    expect(korteInvoer('x'.repeat(50))).toBe(`${'x'.repeat(40)}…`)
    expect(korteInvoer('')).toBeNull()
  })
})
