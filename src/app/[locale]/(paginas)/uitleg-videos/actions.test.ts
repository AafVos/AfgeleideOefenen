import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Geen echte mail en geen echte database: allebei vervangen door een nepje.
const { send, getUser } = vi.hoisted(() => ({
  send: vi.fn<(opties: { to: string }) => Promise<{ error: unknown }>>(),
  getUser: vi.fn(),
}))

/** Wat de nepdatabase en de nep-AI deze keer teruggeven bij het nakijken. */
const db = vi.hoisted(() => ({
  aiZegtGoed: false,
  aiValtOm: false,
  stappen: [] as Array<{ id: string; step_order: number; step_description: string }>,
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))

function maakClient() {
  function from(table: string) {
    const keten = {
      select: () => keten,
      eq: () => keten,
      order: () => Promise.resolve({ data: db.stappen, error: null }),
      maybeSingle: async () =>
        table === 'questions_new'
          ? {
              data: { id: 'q1', answer: '6x', latex_answer: '6x', answer_alternatives: [] },
              error: null,
            }
          : { data: null, error: null },
    }
    return keten
  }

  return { auth: { getUser }, from }
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => maakClient(),
  createServiceRoleClient: () => maakClient(),
}))

vi.mock('@/lib/ai/check-answer-new', () => ({
  checkWrongAnswerNew: async () => {
    if (db.aiValtOm) throw new Error('fetch failed')
    return {
      errorExplanation: db.aiZegtGoed ? '' : 'Je hebt de macht laten staan.',
      category: null,
      fromCache: false,
      isMathematicallyCorrect: db.aiZegtGoed,
      generatedSteps: [],
    }
  },
}))

const { EXTRA_CONTROLE_MISLUKT } = await import('@/lib/practice/nakijken')
const { checkVideoAnswerAction, vraagVideoAction } = await import('./actions')

const LEEG = { error: null, sent: false }

function vraag(tekst: string): FormData {
  const formData = new FormData()
  formData.set('message', tekst)
  return formData
}

beforeEach(() => {
  vi.stubEnv('NOTIFY_EMAIL', 'aaf@example.test')
  vi.stubEnv('RESEND_API_KEY', 're_nep')
  vi.spyOn(console, 'error').mockImplementation(() => {})
  send.mockReset()
  send.mockResolvedValue({ error: null })
  getUser.mockReset()
  getUser.mockResolvedValue({
    data: { user: { id: 'u1', email: 'leerling@example.test' } },
  })
  db.aiZegtGoed = false
  db.aiValtOm = false
  db.stappen = []
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('video-verzoek', () => {
  it('stuurt de vraag naar het adres uit de omgeving', async () => {
    expect(await vraagVideoAction(LEEG, vraag('Kun je 1/x uitleggen?'))).toEqual({
      error: null,
      sent: true,
    })

    expect(send.mock.calls.at(-1)?.[0].to).toBe('aaf@example.test')
  })

  it('stuurt niets als er geen meldadres is ingesteld', async () => {
    vi.stubEnv('NOTIFY_EMAIL', '')

    expect(await vraagVideoAction(LEEG, vraag('Kun je 1/x uitleggen?'))).toEqual({
      error: 'Versturen mislukt. Probeer het later opnieuw.',
      sent: false,
    })

    expect(send).not.toHaveBeenCalled()
  })

  it('zegt het tegen de leerling als de mailsleutel ontbreekt', async () => {
    vi.stubEnv('RESEND_API_KEY', '')

    expect(await vraagVideoAction(LEEG, vraag('Kun je 1/x uitleggen?'))).toEqual({
      error: 'Versturen mislukt. Probeer het later opnieuw.',
      sent: false,
    })

    expect(send).not.toHaveBeenCalled()
  })
})

// =====================================================================
// De oefenvraag bij een uitlegvideo. Er wordt niets opgeslagen: alleen
// nakijken, en bij een fout antwoord de uitwerking erbij.
// =====================================================================

describe('checkVideoAnswerAction', () => {
  it('vraagt eerst om een antwoord', async () => {
    expect(await checkVideoAnswerAction('q1', '   ')).toEqual({
      kind: 'error',
      message: 'Vul eerst een antwoord in.',
    })
  })

  it('rekent een antwoord dat meteen klopt goed', async () => {
    expect(await checkVideoAnswerAction('q1', '6x')).toEqual({ kind: 'correct' })
  })

  it('rekent een goed antwoord in een andere schrijfwijze alsnog goed', async () => {
    db.aiZegtGoed = true

    expect(await checkVideoAnswerAction('q1', '3 \\cdot 2x')).toEqual({ kind: 'correct' })
  })

  it('geeft bij een fout antwoord de uitwerking, zonder extra melding', async () => {
    db.stappen = [{ id: 's1', step_order: 1, step_description: 'Haal de macht naar voren.' }]

    const result = await checkVideoAnswerAction('q1', '3x')

    expect(result).toMatchObject({ kind: 'wrong', correctAnswer: '6x', melding: null })
  })

  it('zegt het tegen de leerling als de extra controle mislukt', async () => {
    db.aiValtOm = true

    const result = await checkVideoAnswerAction('q1', '3x')

    expect(result).toMatchObject({ kind: 'wrong', melding: EXTRA_CONTROLE_MISLUKT })
    expect(JSON.stringify(result)).not.toContain('fetch failed')
  })
})
