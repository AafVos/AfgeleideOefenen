import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Geen echte mail en geen echte database: allebei vervangen door een nepje.
const { send, getUserById, maybeSingle } = vi.hoisted(() => ({
  send: vi.fn<(opties: { html: string }) => Promise<{ error: unknown }>>(),
  getUserById: vi.fn(),
  maybeSingle: vi.fn(),
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => ({
    auth: { admin: { getUserById } },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle }) }),
    }),
  }),
}))

const { POST } = await import('./route')

/** Een seintje zoals Supabase het stuurt bij een nieuwe rij in `auth.users`. */
function seintje(record: Record<string, unknown>) {
  return new Request('https://afgeleideoefenen.nl/api/webhooks/new-user', {
    method: 'POST',
    headers: { 'x-webhook-secret': 'geheimpje', 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'INSERT', table: 'users', record }),
  })
}

/** De rij die de gebruikersnaam in de mail heeft staan. */
function gebruikersnaamInMail(): string {
  const html = send.mock.calls.at(-1)?.[0].html ?? ''
  return html.match(/<b>Gebruikersnaam<\/b><\/td><td>([^<]*)</)?.[1] ?? ''
}

const AUTH_RIJ = {
  id: '11111111-1111-1111-1111-111111111111',
  created_at: '2026-10-09T10:00:00Z',
}

beforeEach(() => {
  vi.stubEnv('WEBHOOK_SECRET', 'geheimpje')
  vi.stubEnv('NOTIFY_EMAIL', 'aaf@example.test')
  vi.stubEnv('RESEND_API_KEY', 're_nep')
  send.mockClear()
  send.mockResolvedValue({ error: null })
  // Standaard: de auth-rij kent het e-mailadres en de gebruikersnaam staat
  // in de metagegevens; in `profiles` staat hij nog niet.
  getUserById.mockResolvedValue({
    data: { user: { email: 'leerling@example.test', user_metadata: { username: 'Sanne' } } },
  })
  maybeSingle.mockResolvedValue({ data: { username: null } })
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('seintje bij een nieuwe gebruiker', () => {
  it('stuurt niets zonder het juiste wachtwoord van de webhook', async () => {
    const req = new Request('https://afgeleideoefenen.nl/api/webhooks/new-user', {
      method: 'POST',
      headers: { 'x-webhook-secret': 'fout' },
      body: '{}',
    })
    expect((await POST(req)).status).toBe(401)
    expect(send).not.toHaveBeenCalled()
  })

  it('pakt de gebruikersnaam uit de metagegevens als profiles nog leeg is', async () => {
    const res = await POST(seintje(AUTH_RIJ))

    expect(res.status).toBe(200)
    expect(gebruikersnaamInMail()).toBe('Sanne')
  })

  it('pakt de gebruikersnaam rechtstreeks uit het seintje als die er al in zit', async () => {
    // Zelfs als het opzoeken helemaal misgaat, blijft de naam staan.
    getUserById.mockRejectedValue(new Error('geen verbinding'))

    await POST(seintje({ ...AUTH_RIJ, raw_user_meta_data: { username: 'Joris' } }))

    expect(gebruikersnaamInMail()).toBe('Joris')
  })

  it('geeft profiles voorrang op de metagegevens', async () => {
    maybeSingle.mockResolvedValue({ data: { username: 'Nieuwe naam' } })

    await POST(seintje(AUTH_RIJ))

    expect(gebruikersnaamInMail()).toBe('Nieuwe naam')
  })

  it('zet een streepje neer als er echt geen gebruikersnaam is', async () => {
    getUserById.mockResolvedValue({
      data: { user: { email: 'leerling@example.test', user_metadata: {} } },
    })

    await POST(seintje(AUTH_RIJ))

    expect(gebruikersnaamInMail()).toBe('—')
  })

  it('stuurt stil niets zonder mailsleutel, maar houdt het bij een 200', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Een foutcode zou Supabase het seintje laten herhalen; dat helpt niet,
    // want zonder sleutel gaat er nooit iets uit.
    expect((await POST(seintje(AUTH_RIJ))).status).toBe(200)
    expect(send).not.toHaveBeenCalled()

    log.mockRestore()
  })

  it('stuurt stil niets zonder ontvanger, in plaats van een mail aan "undefined"', async () => {
    vi.stubEnv('NOTIFY_EMAIL', '')
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect((await POST(seintje(AUTH_RIJ))).status).toBe(200)
    expect(send).not.toHaveBeenCalled()

    log.mockRestore()
  })

  it('negeert een gebruikersnaam die geen bruikbare tekst is', async () => {
    await POST(seintje({ ...AUTH_RIJ, raw_user_meta_data: { username: 42 } }))

    // Valt terug op de metagegevens uit de auth-rij, niet op het getal.
    expect(gebruikersnaamInMail()).toBe('Sanne')
  })
})
