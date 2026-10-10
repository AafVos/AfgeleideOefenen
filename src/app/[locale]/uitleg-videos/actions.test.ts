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
  createServiceRoleClient: () => ({}),
}))

const { vraagVideoAction } = await import('./actions')

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
