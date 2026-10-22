import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Geen echte Supabase-sessie en geen echt netwerk: allebei een nepje.
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }))

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession } },
}))

const { ApiFout, haalIndeling, stuurAntwoordIn } = await import('./app-api')

const INGELOGD = { session: { access_token: 'token-123' } }

function nepFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })
}

beforeEach(() => {
  getSession.mockResolvedValue({ data: INGELOGD })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('app-api', () => {
  it('stuurt het bearer-token van de Supabase-sessie mee', async () => {
    const fetchMock = nepFetch(200, { hoofdstukken: [] })
    vi.stubGlobal('fetch', fetchMock)

    await haalIndeling()

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers.Authorization).toBe('Bearer token-123')
  })

  it('gooit een duidelijke fout zonder ingelogde sessie, zonder te fetchen', async () => {
    getSession.mockResolvedValue({ data: { session: null } })
    const fetchMock = nepFetch(200, {})
    vi.stubGlobal('fetch', fetchMock)

    await expect(haalIndeling()).rejects.toThrow(ApiFout)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('geeft de foutmelding van de server door als het verzoek niet lukt', async () => {
    vi.stubGlobal('fetch', nepFetch(401, { error: 'Niet ingelogd.' }))

    await expect(stuurAntwoordIn('q1', '6x')).rejects.toThrow('Niet ingelogd.')
  })

  it('valt terug op een algemene melding als de server geen foutveld teruggeeft', async () => {
    vi.stubGlobal('fetch', nepFetch(500, {}))

    await expect(stuurAntwoordIn('q1', '6x')).rejects.toThrow(/iets mis/)
  })

  it('geeft het antwoord, de opgave en de eventuele speeltijd door in het verzoek', async () => {
    const fetchMock = nepFetch(200, { kind: 'correct', streak: 1, mastered: false, clusterTitle: 'x' })
    vi.stubGlobal('fetch', fetchMock)

    await stuurAntwoordIn('q1', '6x', 12)

    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/api/app/nakijken')
    expect(JSON.parse(init.body)).toEqual({ questionId: 'q1', userAnswer: '6x', timeSpentSec: 12 })
  })
})
