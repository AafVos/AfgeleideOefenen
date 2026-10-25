import { afterEach, describe, expect, it, vi } from 'vitest'

// =====================================================================
// Net als bij `/api/app/indeling` (AFG-572): zonder geldig bearer-token geen
// aanroep, en gaat één van de Supabase-aanroepen mis, dan moet de route een
// nette foutrespons teruggeven in plaats van een onafgevangen exceptie.
// De berekening zelf (`bouwOnderwerpVoortgang`, `telBeheerst`) heeft al een
// eigen test in `lib/dashboard/indeling.test.ts`.
// =====================================================================

const { authenticateBearer, loadChapters, loadAllTopics, loadAllClusters, loadVoortgang } = vi.hoisted(() => ({
  authenticateBearer: vi.fn(),
  loadChapters: vi.fn(),
  loadAllTopics: vi.fn(),
  loadAllClusters: vi.fn(),
  loadVoortgang: vi.fn(),
}))

vi.mock('@/lib/supabase/bearer', () => ({ authenticateBearer }))
vi.mock('@/lib/practice/chapter-overview', () => ({
  loadChapters,
  loadAllTopics,
  loadAllClusters,
  loadVoortgang,
}))

const { GET } = await import('./route')

const NEP_SUPABASE = { from: () => undefined } as never

function verzoek(): Request {
  return new Request('https://afgeleideoefenen.nl/api/app/voortgang')
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/app/voortgang', () => {
  it('wijst een verzoek zonder geldig bearer-token af', async () => {
    authenticateBearer.mockResolvedValue(null)

    const res = await GET(verzoek())

    expect(res.status).toBe(401)
    expect(loadChapters).not.toHaveBeenCalled()
  })

  it('geeft 200 met de voortgang per hoofdstuk en soort som', async () => {
    authenticateBearer.mockResolvedValue({ supabase: NEP_SUPABASE, userId: 'leerling-1' })
    loadChapters.mockResolvedValue([
      { id: 'h1', slug: 'sinus', title: 'Sinusfuncties', book_part: 1, order_index: 1 },
    ])
    loadAllTopics.mockResolvedValue([
      { id: 't1', slug: 'basis', title: 'Basis', chapter_id: 'h1', order_index: 1, theory_block_id: null },
    ])
    loadAllClusters.mockResolvedValue([
      { id: 'c1', slug: 'som-1', title: 'Som 1', topic_id: 't1', order_index: 1, theory_block_id: null },
      { id: 'c2', slug: 'som-2', title: 'Som 2', topic_id: 't1', order_index: 2, theory_block_id: null },
    ])
    loadVoortgang.mockResolvedValue([{ cluster_id: 'c1', status: 'mastered', correct_streak: 3 }])

    const res = await GET(verzoek())
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({
      hoofdstukken: [
        {
          id: 'h1',
          slug: 'sinus',
          title: 'Sinusfuncties',
          mastered: 1,
          total: 2,
          pct: 50,
          soorten: [
            { id: 'c1', title: 'Som 1', isKnown: true, correctStreak: 3 },
            { id: 'c2', title: 'Som 2', isKnown: false, correctStreak: 0 },
          ],
        },
      ],
    })
    expect(loadVoortgang).toHaveBeenCalledWith(NEP_SUPABASE, 'leerling-1')
  })

  it('geeft een nette foutrespons mét CORS-headers als een database-aanroep misgaat', async () => {
    authenticateBearer.mockResolvedValue({ supabase: NEP_SUPABASE, userId: 'leerling-1' })
    loadChapters.mockResolvedValue([])
    loadAllTopics.mockResolvedValue([])
    loadAllClusters.mockRejectedValue(new Error('database onbereikbaar'))
    loadVoortgang.mockResolvedValue([])

    const res = await GET(verzoek())
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json).toEqual({ error: 'Er ging iets mis. Probeer het nog eens.' })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })
})
