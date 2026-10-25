import { afterEach, describe, expect, it, vi } from 'vitest'

// =====================================================================
// Koppeling tussen de app-route en het nakijken van de site (AFG-558).
//
// De nakijklogica zelf (tekstvergelijking, voortgang, de extra AI-controle)
// heeft al een uitgebreide eigen test: `chapter-actions.test.ts` en
// `nakijken.test.ts`. Deze test gaat over de laag ertussen: komt er een
// geldig bearer-token binnen, dan geeft de route exact door aan
// `nakijkenVoorGebruiker` — dezelfde functie die de site zelf gebruikt — met
// de juiste gebruiker en de juiste velden uit het verzoek, en stuurt hij
// precies terug wat die functie teruggeeft. Zonder geldig token komt er
// nooit een aanroep.
// =====================================================================

const { authenticateBearer, nakijkenVoorGebruiker } = vi.hoisted(() => ({
  authenticateBearer: vi.fn(),
  nakijkenVoorGebruiker: vi.fn(),
}))

vi.mock('@/lib/supabase/bearer', () => ({ authenticateBearer }))
vi.mock('@/lib/practice/chapter-actions', () => ({ nakijkenVoorGebruiker }))

const { POST } = await import('./route')

function verzoek(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://afgeleideoefenen.nl/api/app/nakijken', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

const NEP_SUPABASE = { from: () => undefined } as never

afterEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/app/nakijken', () => {
  it('wijst een verzoek zonder geldig bearer-token af, zonder na te kijken', async () => {
    authenticateBearer.mockResolvedValue(null)

    const res = await POST(verzoek({ questionId: 'q1', userAnswer: '6x' }))

    expect(res.status).toBe(401)
    expect(nakijkenVoorGebruiker).not.toHaveBeenCalled()
  })

  it('geeft questionId, userAnswer en timeSpentSec door aan dezelfde functie als de site', async () => {
    authenticateBearer.mockResolvedValue({ supabase: NEP_SUPABASE, userId: 'u1' })
    nakijkenVoorGebruiker.mockResolvedValue({
      kind: 'correct',
      streak: 1,
      mastered: false,
      clusterTitle: 'Somregel',
    })

    const res = await POST(verzoek({ questionId: 'q1', userAnswer: '6x', timeSpentSec: 12 }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ kind: 'correct', streak: 1, mastered: false, clusterTitle: 'Somregel' })
    expect(nakijkenVoorGebruiker).toHaveBeenCalledWith(NEP_SUPABASE, 'u1', 'q1', '6x', 12)
  })

  it('stuurt de uitslag van een fout antwoord (met stappenplan-gegevens) onveranderd terug', async () => {
    authenticateBearer.mockResolvedValue({ supabase: NEP_SUPABASE, userId: 'u1' })
    nakijkenVoorGebruiker.mockResolvedValue({
      kind: 'incorrect',
      answerId: 'a1',
      correctAnswer: '6x',
      latexCorrectAnswer: '6x',
      errorExplanation: null,
      melding: null,
    })

    const res = await POST(verzoek({ questionId: 'q1', userAnswer: '5x' }))
    const json = await res.json()

    expect(json.kind).toBe('incorrect')
    expect(json.correctAnswer).toBe('6x')
  })

  it('weigert een verzoek zonder userAnswer, zonder de database aan te raken', async () => {
    authenticateBearer.mockResolvedValue({ supabase: NEP_SUPABASE, userId: 'u1' })

    const res = await POST(verzoek({ questionId: 'q1' }))

    expect(res.status).toBe(400)
    expect(nakijkenVoorGebruiker).not.toHaveBeenCalled()
  })

  it('vangt een gegooide fout op in plaats van om te vallen', async () => {
    authenticateBearer.mockResolvedValue({ supabase: NEP_SUPABASE, userId: 'u1' })
    nakijkenVoorGebruiker.mockRejectedValue(new Error('fetch failed'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const res = await POST(verzoek({ questionId: 'q1', userAnswer: '6x' }))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json).toEqual({
      kind: 'error',
      message: 'Opslaan is niet gelukt. Probeer het nog eens.',
    })
    expect(res.headers.get('access-control-allow-origin')).toBeTruthy()
    expect(JSON.stringify(json)).not.toContain('fetch failed')

    vi.restoreAllMocks()
  })

  it('geeft 400 bij ongeldige JSON in plaats van om te vallen', async () => {
    authenticateBearer.mockResolvedValue({ supabase: NEP_SUPABASE, userId: 'u1' })
    const res = await POST(
      new Request('https://afgeleideoefenen.nl/api/app/nakijken', {
        method: 'POST',
        body: '{niet geldige json',
      }),
    )

    expect(res.status).toBe(400)
    expect(nakijkenVoorGebruiker).not.toHaveBeenCalled()
  })
})
