import { afterEach, describe, expect, it, vi } from 'vitest'

// =====================================================================
// Deze test gaat over de laag rond het ophalen van één opgave (AFG-572):
// zonder geldig bearer-token of zonder clusterId geen aanroep, en gaat één
// van de Supabase-aanroepen in de `Promise.all` mis, dan moet de route een
// nette foutrespons teruggeven in plaats van een onafgevangen exceptie —
// anders mist de respons de CORS-headers die de app nodig heeft.
// =====================================================================

const { authenticateBearer, loadLaatsteAntwoorden, loadQuestionNew, loadVragenVoorCluster } = vi.hoisted(() => ({
  authenticateBearer: vi.fn(),
  loadLaatsteAntwoorden: vi.fn(),
  loadQuestionNew: vi.fn(),
  loadVragenVoorCluster: vi.fn(),
}))

vi.mock('@/lib/supabase/bearer', () => ({ authenticateBearer }))
vi.mock('@/lib/practice/chapter-overview', () => ({
  loadLaatsteAntwoorden,
  loadQuestionNew,
  loadVragenVoorCluster,
}))

const { GET } = await import('./route')

function verzoek(clusterId?: string): Request {
  const url = new URL('https://afgeleideoefenen.nl/api/app/opgave')
  if (clusterId) url.searchParams.set('clusterId', clusterId)
  return new Request(url)
}

function nepSupabase(clusterFout?: Error) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: clusterFout
            ? () => Promise.reject(clusterFout)
            : () => Promise.resolve({ data: { title: 'Somregel' } }),
        }),
      }),
    }),
  } as never
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/app/opgave', () => {
  it('wijst een verzoek zonder geldig bearer-token af', async () => {
    authenticateBearer.mockResolvedValue(null)

    const res = await GET(verzoek('c1'))

    expect(res.status).toBe(401)
    expect(loadVragenVoorCluster).not.toHaveBeenCalled()
  })

  it('weigert een verzoek zonder clusterId, zonder de database aan te raken', async () => {
    authenticateBearer.mockResolvedValue({ supabase: nepSupabase() })

    const res = await GET(verzoek())

    expect(res.status).toBe(400)
    expect(loadVragenVoorCluster).not.toHaveBeenCalled()
  })

  it('geeft een nette foutrespons mét CORS-headers als een database-aanroep misgaat', async () => {
    authenticateBearer.mockResolvedValue({ supabase: nepSupabase(new Error('database onbereikbaar')) })
    loadVragenVoorCluster.mockResolvedValue([{ id: 'q1' }])
    loadLaatsteAntwoorden.mockResolvedValue(new Map())

    const res = await GET(verzoek('c1'))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json).toEqual({ error: 'Er ging iets mis. Probeer het nog eens.' })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(loadQuestionNew).not.toHaveBeenCalled()
  })

  it('geeft 404 als er geen opgaven zijn in deze soort som', async () => {
    authenticateBearer.mockResolvedValue({ supabase: nepSupabase() })
    loadVragenVoorCluster.mockResolvedValue([])
    loadLaatsteAntwoorden.mockResolvedValue(new Map())

    const res = await GET(verzoek('c1'))

    expect(res.status).toBe(404)
  })
})
