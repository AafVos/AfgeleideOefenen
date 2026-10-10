import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Geen echte mail en geen echte database: allebei vervangen door een nepje.
const { send, getUser } = vi.hoisted(() => ({
  send: vi.fn<(opties: { to: string }) => Promise<{ error: unknown }>>(),
  getUser: vi.fn(),
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser } }),
}))

const { askAafAction, sendFeedbackAction } = await import('./actions')

const LEEG = { error: null, sent: false }

function bericht(tekst: string): FormData {
  const formData = new FormData()
  formData.set('message', tekst)
  return formData
}

/** Het adres waar de laatste mail heen ging. */
function naarAdres(): string | undefined {
  return send.mock.calls.at(-1)?.[0].to
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
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('vraag via Aaf', () => {
  it('stuurt de vraag naar het adres uit de omgeving', async () => {
    expect(await askAafAction(LEEG, bericht('Hoe werkt de kettingregel?'))).toEqual({
      error: null,
      sent: true,
    })

    expect(naarAdres()).toBe('aaf@example.test')
  })

  it('stuurt niets als er geen meldadres is ingesteld', async () => {
    vi.stubEnv('NOTIFY_EMAIL', '')

    expect(await askAafAction(LEEG, bericht('Hoe werkt de kettingregel?'))).toEqual({
      error: 'Versturen is niet gelukt. Probeer het later nog eens.',
      sent: false,
    })

    expect(send).not.toHaveBeenCalled()
  })

  it('zegt het tegen de leerling als de mailsleutel ontbreekt', async () => {
    vi.stubEnv('RESEND_API_KEY', '')

    expect(await askAafAction(LEEG, bericht('Hoe werkt de kettingregel?'))).toEqual({
      error: 'Versturen is niet gelukt. Probeer het later nog eens.',
      sent: false,
    })

    expect(send).not.toHaveBeenCalled()
  })
})

describe('feedback', () => {
  it('stuurt het bericht naar het adres uit de omgeving', async () => {
    expect(await sendFeedbackAction(LEEG, bericht('Fijne site!'))).toEqual({
      error: null,
      sent: true,
    })

    expect(naarAdres()).toBe('aaf@example.test')
  })

  it('stuurt niets als er geen meldadres is ingesteld', async () => {
    vi.stubEnv('NOTIFY_EMAIL', '   ')

    expect(await sendFeedbackAction(LEEG, bericht('Fijne site!'))).toEqual({
      error: 'Versturen is niet gelukt. Probeer het later nog eens.',
      sent: false,
    })

    expect(send).not.toHaveBeenCalled()
  })

  it('zegt het tegen de leerling als de mailsleutel ontbreekt', async () => {
    vi.stubEnv('RESEND_API_KEY', '')

    expect(await sendFeedbackAction(LEEG, bericht('Fijne site!'))).toEqual({
      error: 'Versturen is niet gelukt. Probeer het later nog eens.',
      sent: false,
    })

    expect(send).not.toHaveBeenCalled()
  })

  it('stuurt niets als de leerling niet is ingelogd', async () => {
    getUser.mockResolvedValue({ data: { user: null } })

    expect(await sendFeedbackAction(LEEG, bericht('Fijne site!'))).toEqual({
      error: 'Niet ingelogd.',
      sent: false,
    })

    expect(send).not.toHaveBeenCalled()
  })
})
