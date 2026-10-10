import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** De velden van de mail die we aan Resend meegeven. */
type Mail = {
  from: string
  to: string
  subject: string
  html: string
  text: string
}

// Geen echte mail en geen echte database: allebei vervangen door een nepje.
const { send, getUserById, updateUserById } = vi.hoisted(() => ({
  send: vi.fn<(mail: Mail) => Promise<{ error: unknown }>>(),
  getUserById: vi.fn(),
  updateUserById: vi.fn(),
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => ({
    auth: { admin: { getUserById, updateUserById } },
  }),
}))

const { stuurWelkomstmail } = await import('./welkom')

const USER_ID = '11111111-1111-1111-1111-111111111111'

/** De waarde van de vlag zoals die het laatst is weggeschreven. */
function laatsteVlag(): unknown {
  return updateUserById.mock.calls.at(-1)?.[1]?.user_metadata?.welcome_sent_at
}

beforeEach(() => {
  vi.stubEnv('RESEND_API_KEY', 're_nep')
  vi.spyOn(console, 'error').mockImplementation(() => {})
  send.mockReset()
  send.mockResolvedValue({ error: null })
  getUserById.mockReset()
  getUserById.mockResolvedValue({
    data: {
      user: {
        id: USER_ID,
        email: 'leerling@example.test',
        email_confirmed_at: '2026-10-09T10:00:00Z',
        user_metadata: { username: 'Sanne' },
      },
    },
    error: null,
  })
  updateUserById.mockReset()
  updateUserById.mockResolvedValue({ data: {}, error: null })
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('welkomstmail', () => {
  it('stuurt de mail en laat de vlag staan als het goed gaat', async () => {
    expect(await stuurWelkomstmail(USER_ID)).toEqual({ verstuurd: true })

    expect(send).toHaveBeenCalledTimes(1)
    expect(updateUserById).toHaveBeenCalledTimes(1)
    expect(laatsteVlag()).toEqual(expect.any(String))
  })

  it('zet de vlag niet als de mailsleutel ontbreekt', async () => {
    vi.stubEnv('RESEND_API_KEY', '')

    expect(await stuurWelkomstmail(USER_ID)).toEqual({
      verstuurd: false,
      reden: 'geen-sleutel',
    })

    expect(updateUserById).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('draait de vlag terug als Resend een fout teruggeeft', async () => {
    send.mockResolvedValue({ error: { message: 'niet verstuurd' } })

    expect(await stuurWelkomstmail(USER_ID)).toEqual({ verstuurd: false, reden: 'fout' })

    expect(laatsteVlag()).toBeNull()
  })

  it('draait de vlag terug als het versturen een fout gooit', async () => {
    send.mockRejectedValue(new Error('geen verbinding'))

    expect(await stuurWelkomstmail(USER_ID)).toEqual({ verstuurd: false, reden: 'fout' })

    expect(laatsteVlag()).toBeNull()
  })

  it('houdt de overige metagegevens heel bij het terugdraaien', async () => {
    send.mockRejectedValue(new Error('geen verbinding'))

    await stuurWelkomstmail(USER_ID)

    expect(updateUserById.mock.calls.at(-1)?.[1]?.user_metadata?.username).toBe('Sanne')
  })

  // De welkomstmail gaat via Resend en niet via Supabase, dus hij komt in de
  // e2e-tests nooit in de testpostbus terecht. Wat erin staat, controleren we
  // daarom hier: Nederlands, de merknaam van deze site, en de link waar de
  // leerling op moet klikken.
  it('stuurt een Nederlandse mail van AfgeleideOefenen', async () => {
    await stuurWelkomstmail(USER_ID)

    const mail = send.mock.calls[0][0]

    expect(mail.to).toBe('leerling@example.test')
    expect(mail.subject).toBe('Welkom bij AfgeleideOefenen!')
    expect(mail.from).toContain('AfgeleideOefenen')
    expect(mail.from).toContain('afgeleideoefenen.nl')

    // Dezelfde boodschap in beide versies, zodat een mailprogramma dat geen
    // opmaak laat zien er ook iets van maakt.
    for (const versie of [mail.html, mail.text]) {
      expect(versie).toContain('Je account is klaar.')
      expect(versie).toContain('Groeten van Aaf')
      expect(versie).toContain('/nl/uitleg-videos')
    }
  })

  it('stuurt niets als er al een welkomstmail uit is', async () => {
    getUserById.mockResolvedValue({
      data: {
        user: {
          id: USER_ID,
          email: 'leerling@example.test',
          email_confirmed_at: '2026-10-09T10:00:00Z',
          user_metadata: { welcome_sent_at: '2026-10-09T10:05:00Z' },
        },
      },
      error: null,
    })

    expect(await stuurWelkomstmail(USER_ID)).toEqual({
      verstuurd: false,
      reden: 'al-verstuurd',
    })

    expect(send).not.toHaveBeenCalled()
  })
})
