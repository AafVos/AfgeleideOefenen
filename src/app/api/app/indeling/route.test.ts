import { afterEach, describe, expect, it, vi } from 'vitest'

// =====================================================================
// De opbouw van de indeling zelf (`bouwOefenOverzicht`) heeft een eigen
// test. Deze test gaat over de laag eromheen (AFG-572): zonder geldig
// bearer-token geen aanroep, en gaat één van de Supabase-aanroepen in de
// `Promise.all` mis, dan moet de route een nette foutrespons teruggeven in
// plaats van een onafgevangen exceptie — anders mist de respons de
// CORS-headers die de app nodig heeft.
// =====================================================================

const { authenticateBearer, loadChapters, loadParagraphs, loadTheoryBlocks, loadAllTopics, loadAllClusters, loadAlleVragen } =
  vi.hoisted(() => ({
    authenticateBearer: vi.fn(),
    loadChapters: vi.fn(),
    loadParagraphs: vi.fn(),
    loadTheoryBlocks: vi.fn(),
    loadAllTopics: vi.fn(),
    loadAllClusters: vi.fn(),
    loadAlleVragen: vi.fn(),
  }))

vi.mock('@/lib/supabase/bearer', () => ({ authenticateBearer }))
vi.mock('@/lib/practice/chapter-overview', () => ({
  loadChapters,
  loadParagraphs,
  loadTheoryBlocks,
  loadAllTopics,
  loadAllClusters,
  loadAlleVragen,
}))

const { GET } = await import('./route')

const NEP_SUPABASE = { from: () => undefined } as never

function verzoek(): Request {
  return new Request('https://afgeleideoefenen.nl/api/app/indeling')
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/app/indeling', () => {
  it('wijst een verzoek zonder geldig bearer-token af', async () => {
    authenticateBearer.mockResolvedValue(null)

    const res = await GET(verzoek())

    expect(res.status).toBe(401)
    expect(loadChapters).not.toHaveBeenCalled()
  })

  it('geeft 200 met de indeling als alle aanroepen lukken', async () => {
    authenticateBearer.mockResolvedValue({ supabase: NEP_SUPABASE })
    loadChapters.mockResolvedValue([])
    loadParagraphs.mockResolvedValue([])
    loadTheoryBlocks.mockResolvedValue([])
    loadAllTopics.mockResolvedValue([])
    loadAllClusters.mockResolvedValue([])
    loadAlleVragen.mockResolvedValue([])

    const res = await GET(verzoek())
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ hoofdstukken: [] })
  })

  it('geeft een nette foutrespons mét CORS-headers als een database-aanroep misgaat', async () => {
    authenticateBearer.mockResolvedValue({ supabase: NEP_SUPABASE })
    loadChapters.mockResolvedValue([])
    loadParagraphs.mockResolvedValue([])
    loadTheoryBlocks.mockResolvedValue([])
    loadAllTopics.mockResolvedValue([])
    loadAllClusters.mockRejectedValue(new Error('database onbereikbaar'))
    loadAlleVragen.mockResolvedValue([])

    const res = await GET(verzoek())
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json).toEqual({ error: 'Er ging iets mis. Probeer het nog eens.' })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })
})
