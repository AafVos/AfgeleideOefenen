import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// =====================================================================
// De gedeelde nakijkstap: tekstvergelijking, opslaan, en pas daarna de
// extra controle op een andere schrijfwijze.
//
// Geen Supabase en geen Gemini: de AI-controle is hier een nepfunctie die
// precies dat teruggeeft wat de test nodig heeft.
// =====================================================================

type AiUitkomst =
  | { errorExplanation: string; isMathematicallyCorrect: boolean }
  | { error: string }

/** Wat de nep-AI deze keer doet: iets teruggeven, of omvallen. */
let aiUitkomst: AiUitkomst
let aiValtOm: Error | null
let aiAanroepen: number

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({}),
  createServiceRoleClient: () => ({}),
}))

vi.mock('@/lib/ai/check-answer-new', () => ({
  checkWrongAnswerNew: async () => {
    aiAanroepen += 1
    if (aiValtOm) throw aiValtOm
    return aiUitkomst
  },
}))

const { EXTRA_CONTROLE_MISLUKT, kijkAntwoordNa, OpslagMislukt, rekenAlsnogGoed, vangOpslag } =
  await import('./nakijken')

type DbFout = { code: string; message: string }

/** Nepdatabase met één `update().eq()`, die wel of niet een fout teruggeeft. */
function nepDb(fout: DbFout | null) {
  const bijgewerkt: Record<string, unknown>[] = []
  const db = {
    from: () => ({
      update: (v: Record<string, unknown>) => ({
        eq: async () => {
          if (!fout) bijgewerkt.push(v)
          return { data: null, error: fout }
        },
      }),
    }),
  }
  return { db: db as unknown as Parameters<typeof rekenAlsnogGoed>[0], bijgewerkt }
}

function nakijken(userAnswer: string, bewaar?: (goed: boolean) => Promise<void>) {
  return kijkAntwoordNa({
    questionId: 'q1',
    userAnswer,
    correctAnswer: '6x',
    alternatives: ['6 \\cdot x'],
    bewaar,
  })
}

describe('kijkAntwoordNa', () => {
  beforeEach(() => {
    aiUitkomst = { errorExplanation: 'Je hebt de macht laten staan.', isMathematicallyCorrect: false }
    aiValtOm = null
    aiAanroepen = 0
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rekent een antwoord dat meteen klopt goed, zonder extra controle', async () => {
    const uitslag = await nakijken('6x')

    expect(uitslag).toEqual({ goed: true, viaExtraControle: false, uitleg: null, melding: null })
    expect(aiAanroepen).toBe(0)
  })

  it('kent de alternatieve schrijfwijzen die al bij de vraag staan', async () => {
    const uitslag = await nakijken('6 \\cdot x')

    expect(uitslag.goed).toBe(true)
    expect(aiAanroepen).toBe(0)
  })

  it('rekent een andere schrijfwijze alsnog goed als de extra controle dat zegt', async () => {
    aiUitkomst = { errorExplanation: '', isMathematicallyCorrect: true }

    const uitslag = await nakijken('3 \\cdot 2x')

    expect(uitslag).toEqual({ goed: true, viaExtraControle: true, uitleg: null, melding: null })
    expect(aiAanroepen).toBe(1)
  })

  it('geeft bij een echt fout antwoord de uitleg terug, zonder melding', async () => {
    const uitslag = await nakijken('3x')

    expect(uitslag).toEqual({
      goed: false,
      viaExtraControle: false,
      uitleg: 'Je hebt de macht laten staan.',
      melding: null,
    })
  })

  it('zegt het tegen de leerling als de extra controle een fout teruggeeft', async () => {
    aiUitkomst = { error: 'Gemini: 503 Service Unavailable' }

    const uitslag = await nakijken('3x')

    expect(uitslag).toEqual({
      goed: false,
      viaExtraControle: false,
      uitleg: null,
      melding: EXTRA_CONTROLE_MISLUKT,
    })
    // De technische tekst blijft in de log en komt niet op het scherm.
    expect(JSON.stringify(uitslag)).not.toContain('503')
    expect(vi.mocked(console.error).mock.calls.flat().join(' ')).toContain('503')
  })

  it('zegt het ook als de extra controle helemaal omvalt', async () => {
    aiValtOm = new Error('fetch failed')

    const uitslag = await nakijken('3x')

    expect(uitslag.goed).toBe(false)
    expect(uitslag.melding).toBe(EXTRA_CONTROLE_MISLUKT)
    expect(JSON.stringify(uitslag)).not.toContain('fetch failed')
  })

  it('slaat het antwoord op vóór de extra controle, met de uitslag van de tekstvergelijking', async () => {
    const volgorde: string[] = []
    aiUitkomst = { errorExplanation: '', isMathematicallyCorrect: true }

    const uitslag = await nakijken('3 \\cdot 2x', async (goed) => {
      volgorde.push(`bewaard:${goed}`)
    })

    expect(volgorde).toEqual(['bewaard:false'])
    // Pas daarna rekent de extra controle het alsnog goed.
    expect(uitslag.viaExtraControle).toBe(true)
  })

  it('bewaart het antwoord ook als de extra controle omvalt', async () => {
    aiValtOm = new Error('fetch failed')
    let bewaard = false

    await nakijken('3x', async () => {
      bewaard = true
    })

    expect(bewaard).toBe(true)
  })

  it('stopt zonder extra controle als het opslaan mislukt', async () => {
    await expect(
      nakijken('3x', async () => {
        throw new OpslagMislukt()
      }),
    ).rejects.toBeInstanceOf(OpslagMislukt)

    expect(aiAanroepen).toBe(0)
  })
})

describe('vangOpslag', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('geeft een Nederlandse zin terug en logt een onbekende fout', async () => {
    const uitslag = vangOpslag('[test]', new Error('permission denied for table x'))

    expect(uitslag).toEqual({
      kind: 'error',
      message: 'Opslaan is niet gelukt. Probeer het nog eens.',
    })
    expect(JSON.stringify(uitslag)).not.toContain('permission denied')
    expect(vi.mocked(console.error).mock.calls.flat().join(' ')).toContain('permission denied')
  })

  it('logt niet nog een keer als de fout al gemeld is', async () => {
    vangOpslag('[test]', new OpslagMislukt())

    expect(vi.mocked(console.error)).not.toHaveBeenCalled()
  })
})

describe('rekenAlsnogGoed', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('zet het antwoord op goed', async () => {
    const { db, bijgewerkt } = nepDb(null)

    await rekenAlsnogGoed(db, '[test]', 'a1')

    expect(bijgewerkt).toEqual([{ is_correct: true }])
    expect(vi.mocked(console.error)).not.toHaveBeenCalled()
  })

  it('logt het als de database het niet aanneemt', async () => {
    const { db } = nepDb({ code: '42501', message: 'permission denied for table x' })

    await rekenAlsnogGoed(db, '[test] alsnog goed rekenen mislukt:', 'a1')

    expect(vi.mocked(console.error).mock.calls.flat().join(' ')).toContain('permission denied')
  })
})
