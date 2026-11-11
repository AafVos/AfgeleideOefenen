import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Geen echte database en geen echte mail: allemaal nepjes.
const {
  exchangeCodeForSession,
  zetGekozenGebruikersnaam,
  stuurWelkomstmail,
  bestemmingNaInloggen,
  bestemmingNaBevestigen,
  profielUpdate,
} = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  zetGekozenGebruikersnaam: vi.fn(),
  stuurWelkomstmail: vi.fn(),
  bestemmingNaInloggen: vi.fn(),
  bestemmingNaBevestigen: vi.fn(),
  profielUpdate: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { exchangeCodeForSession },
    from: (tabel: string) => ({
      update: (waarden: Record<string, unknown>) => ({
        eq: (kolom: string, waarde: unknown) => ({
          is: (kolom2: string, waarde2: unknown) => {
            profielUpdate(tabel, waarden, kolom, waarde, kolom2, waarde2)
            return Promise.resolve({ error: null })
          },
        }),
      }),
    }),
  }),
}))
vi.mock('@/lib/supabase/gebruikersnaam', () => ({ zetGekozenGebruikersnaam }))
vi.mock('@/lib/email/welkom', () => ({ stuurWelkomstmail }))
vi.mock('@/lib/auth/bestemming', () => ({
  bestemmingNaInloggen,
  bestemmingNaBevestigen,
}))
vi.mock('next/server', async (origineel) => ({
  ...(await origineel<typeof import('next/server')>()),
  after: (taak: () => unknown) => {
    void taak()
  },
}))

const { GET } = await import('./route')

function verzoek(zoekreeks: string) {
  return new NextRequest(`https://afgeleideoefenen.nl/auth/callback${zoekreeks}`)
}

/** Een leerling die net via Google is binnengekomen. */
function gebruiker(extra: Record<string, unknown> = {}) {
  return {
    id: 'u-1',
    created_at: new Date().toISOString(),
    app_metadata: { provider: 'google', providers: ['google'] },
    user_metadata: { username: 'Sam' },
    ...extra,
  }
}

async function naarGoogleEnTerug(zoekreeks = '?via=google&code=abc&next=%2Fdashboard') {
  const antwoord = await GET(verzoek(zoekreeks))
  return antwoord.headers.get('location')
}

beforeEach(() => {
  vi.clearAllMocks()
  bestemmingNaInloggen.mockResolvedValue('/nl/dashboard')
  stuurWelkomstmail.mockResolvedValue({ verstuurd: false, reden: 'al-verstuurd' })
  zetGekozenGebruikersnaam.mockResolvedValue(undefined)
})

describe('terugkeer van Google: telt de aanmelding mee', () => {
  it('geeft een gloednieuw account mee aan de klikmeting', async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: gebruiker() }, error: null })

    expect(await naarGoogleEnTerug()).toBe(
      'https://afgeleideoefenen.nl/nl/dashboard?nieuw=google',
    )
  })

  it('doet dat niet bij een leerling die opnieuw inlogt', async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { user: gebruiker({ created_at: '2026-09-01T10:00:00.000Z' }) },
      error: null,
    })

    expect(await naarGoogleEnTerug()).toBe('https://afgeleideoefenen.nl/nl/dashboard')
  })

  it('geeft het ook mee via de omweg langs de naamvraag', async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { user: gebruiker({ user_metadata: {} }) },
      error: null,
    })

    expect(
      await naarGoogleEnTerug('?via=google&code=abc&next=%2Foefenen%3Fchapter%3Dh2'),
    ).toBe(
      'https://afgeleideoefenen.nl/nl/gebruikersnaam?naar=%2Foefenen%3Fchapter%3Dh2&nieuw=google',
    )
  })

  it('houdt de gekozen soort som heel', async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: gebruiker() }, error: null })
    bestemmingNaInloggen.mockResolvedValue('/nl/oefenen?chapter=h2&topic=h2_machtsregel')

    expect(
      await naarGoogleEnTerug('?via=google&code=abc&next=%2Foefenen%3Fchapter%3Dh2'),
    ).toBe(
      'https://afgeleideoefenen.nl/nl/oefenen?chapter=h2&topic=h2_machtsregel&nieuw=google',
    )
  })

  it('meldt niets als het inwisselen van de code misgaat', async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: null }, error: new Error('x') })

    expect(await naarGoogleEnTerug()).toBe(
      'https://afgeleideoefenen.nl/nl/inloggen?error=auth_callback_failed',
    )
  })

  it('meldt niets als de leerling bij Google annuleert', async () => {
    expect(await naarGoogleEnTerug('?via=google&error=access_denied')).toBe(
      'https://afgeleideoefenen.nl/nl/inloggen?error=google_afgebroken',
    )
    expect(exchangeCodeForSession).not.toHaveBeenCalled()
  })
})

describe('terugkeer van Google: herkomst', () => {
  it('zet de meegegeven herkomst op het profiel van een gloednieuw account', async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: gebruiker() }, error: null })

    await naarGoogleEnTerug('?via=google&code=abc&next=%2Fdashboard&van=youtube')

    expect(profielUpdate).toHaveBeenCalledWith(
      'profiles',
      { herkomst: 'youtube' },
      'id',
      'u-1',
      'herkomst',
      null,
    )
  })

  it('zet niets als er geen ?van= meekomt', async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: gebruiker() }, error: null })

    await naarGoogleEnTerug()

    expect(profielUpdate).not.toHaveBeenCalled()
  })

  it('negeert een onbekende herkomst', async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: gebruiker() }, error: null })

    await naarGoogleEnTerug('?via=google&code=abc&next=%2Fdashboard&van=reclame')

    expect(profielUpdate).not.toHaveBeenCalled()
  })

  it('zet niets bij een leerling die opnieuw inlogt', async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { user: gebruiker({ created_at: '2026-09-01T10:00:00.000Z' }) },
      error: null,
    })

    await naarGoogleEnTerug('?via=google&code=abc&next=%2Fdashboard&van=youtube')

    expect(profielUpdate).not.toHaveBeenCalled()
  })
})
