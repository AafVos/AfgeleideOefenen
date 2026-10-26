import { beforeEach, describe, expect, it, vi } from 'vitest'

// Geen echte database en geen echt koekje: allebei een nepje.
const { rpc, getAll, getClaims } = vi.hoisted(() => ({
  rpc: vi.fn(),
  getAll: vi.fn<() => { name: string }[]>(),
  getClaims: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => ({ rpc }),
  createClient: async () => ({ auth: { getClaims } }),
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({ getAll }),
}))

const { POST } = await import('./route')

const SESSIE = '7a1e0c4e-2b6f-4e2a-9d1e-3f8a5c6b7d20'
const TELEFOON =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1'

function zending(rijen: unknown, userAgent = TELEFOON) {
  return new Request('https://afgeleideoefenen.nl/api/meet', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': userAgent },
    body: typeof rijen === 'string' ? rijen : JSON.stringify(rijen),
  })
}

function klik(extra: Record<string, unknown> = {}) {
  return {
    sessie_id: SESSIE,
    soort: 'klik',
    pad: '/nl/oefenen?chapter=h2',
    doel: 'oefenen-nakijken',
    apparaat: 'telefoon',
    ...extra,
  }
}

/** Wat er aan `meet_opslaan` is meegegeven. */
function weggeschreven() {
  return rpc.mock.calls.at(-1)?.[1]?.gebeurtenissen ?? []
}

/** De schuilnaam die aan `meet_opslaan` is meegegeven. */
function meegegevenSchuilnaam() {
  return rpc.mock.calls.at(-1)?.[1]?.schuilnaam ?? null
}

const INGELOGD = [{ name: 'sb-abcdef-auth-token' }]
const GEBRUIKER = '11111111-1111-1111-1111-111111111111'

beforeEach(() => {
  rpc.mockReset()
  rpc.mockResolvedValue({ data: 1, error: null })
  getAll.mockReturnValue([])
  getClaims.mockReset()
  getClaims.mockResolvedValue({ data: { claims: { sub: GEBRUIKER } } })
  vi.stubEnv('MEET_SCHUILNAAM_GEHEIM', 'proef-geheim-niet-echt')
})

describe('POST /api/meet', () => {
  it('schrijft een schone rij weg en antwoordt zonder inhoud', async () => {
    const antwoord = await POST(zending([klik()]))

    expect(antwoord.status).toBe(204)
    expect(rpc).toHaveBeenCalledWith('meet_opslaan', expect.anything())
    expect(weggeschreven()).toEqual([
      {
        sessie_id: SESSIE,
        soort: 'klik',
        // De queryparameter chapter hoort er niet bij.
        pad: '/nl/oefenen',
        doel: 'oefenen-nakijken',
        waarde: null,
        apparaat: 'telefoon',
        verwijzer: null,
        utm_source: null,
        ingelogd: false,
      },
    ])
  })

  it('bepaalt zelf of iemand is ingelogd, uit het sessiekoekje', async () => {
    getAll.mockReturnValue(INGELOGD)

    await POST(zending([klik({ ingelogd: false })]))

    expect(weggeschreven()[0].ingelogd).toBe(true)
  })

  it('stuurt de schuilnaam mee, en nooit het gebruikers-id', async () => {
    getAll.mockReturnValue(INGELOGD)

    await POST(zending([klik()]))

    // Dezelfde uitkomst als meet_schuilnaam() in de database, zie
    // src/lib/meten/schuilnaam.test.ts.
    expect(meegegevenSchuilnaam()).toBe('0cb66a76537cbfb0')
    expect(JSON.stringify(rpc.mock.calls.at(-1))).not.toContain(GEBRUIKER)
  })

  it('vraagt Supabase niets als er geen sessiekoekje is', async () => {
    await POST(zending([klik()]))

    expect(getClaims).not.toHaveBeenCalled()
    expect(meegegevenSchuilnaam()).toBeNull()
    expect(weggeschreven()[0].ingelogd).toBe(false)
  })

  it('laat de schuilnaam leeg zonder geheim', async () => {
    getAll.mockReturnValue(INGELOGD)
    vi.stubEnv('MEET_SCHUILNAAM_GEHEIM', '')

    await POST(zending([klik()]))

    expect(meegegevenSchuilnaam()).toBeNull()
    expect(weggeschreven()[0].ingelogd).toBe(true)
  })

  it('meet gewoon door als het uitlezen van de sessie mislukt', async () => {
    getAll.mockReturnValue(INGELOGD)
    getClaims.mockRejectedValue(new Error('auth plat'))

    await POST(zending([klik()]))

    expect(weggeschreven()[0].ingelogd).toBe(true)
    expect(meegegevenSchuilnaam()).toBeNull()
  })

  it('laat de browser geen inlog-gebeurtenis verzinnen', async () => {
    // `inlog` zet de database er zelf bij, op het moment dat het omslaat.
    await POST(zending([klik({ soort: 'inlog' })]))

    expect(rpc).not.toHaveBeenCalled()
  })

  it('neemt een geslaagde aanmelding wel aan', async () => {
    await POST(zending([klik({ soort: 'registratie', doel: null })]))

    expect(weggeschreven()[0].soort).toBe('registratie')
  })

  it('negeert een crawler', async () => {
    const antwoord = await POST(zending([klik()], 'Mozilla/5.0 (compatible; Googlebot/2.1)'))

    expect(antwoord.status).toBe(204)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('negeert onzin en een lege verzending', async () => {
    expect((await POST(zending('geen json'))).status).toBe(204)
    expect((await POST(zending([]))).status).toBe(204)
    expect((await POST(zending([{ soort: 'klik' }]))).status).toBe(204)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('negeert een verzending die veel te groot is', async () => {
    const veel = JSON.stringify(Array.from({ length: 2000 }, () => klik()))

    expect((await POST(zending(veel))).status).toBe(204)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('laat een leerling nooit merken dat de database stuk is', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'kapot' } })
    const stil = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect((await POST(zending([klik()]))).status).toBe(204)

    stil.mockRestore()
  })
})
