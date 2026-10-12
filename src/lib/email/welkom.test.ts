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
const { send, getUserById, updateUserById, maybeSingle, insertClaim, deleteClaim } =
  vi.hoisted(() => ({
    send: vi.fn<(mail: Mail) => Promise<{ error: unknown }>>(),
    getUserById: vi.fn(),
    updateUserById: vi.fn(),
    maybeSingle: vi.fn(),
    insertClaim: vi.fn(),
    deleteClaim: vi.fn(),
  }))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => ({
    auth: { admin: { getUserById, updateUserById } },
    from: (tabel: string) => {
      if (tabel === 'welkomstmail_claim') {
        return {
          insert: insertClaim,
          delete: () => ({ eq: deleteClaim }),
        }
      }
      return {
        select: () => ({
          eq: () => ({ maybeSingle }),
        }),
      }
    },
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
  insertClaim.mockReset()
  insertClaim.mockResolvedValue({ error: null })
  deleteClaim.mockReset()
  deleteClaim.mockResolvedValue({ error: null })
  maybeSingle.mockReset()
  maybeSingle.mockResolvedValue({ data: { username: 'Sanne' }, error: null })
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
    expect(insertClaim).toHaveBeenCalledWith({ user_id: USER_ID })
    expect(laatsteVlag()).toEqual(expect.any(String))
    expect(deleteClaim).not.toHaveBeenCalled()
  })

  it('zet de vlag niet als de mailsleutel ontbreekt', async () => {
    vi.stubEnv('RESEND_API_KEY', '')

    expect(await stuurWelkomstmail(USER_ID)).toEqual({
      verstuurd: false,
      reden: 'geen-sleutel',
    })

    expect(updateUserById).not.toHaveBeenCalled()
    expect(insertClaim).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('draait de vlag terug als Resend een fout teruggeeft', async () => {
    send.mockResolvedValue({ error: { message: 'niet verstuurd' } })

    expect(await stuurWelkomstmail(USER_ID)).toEqual({ verstuurd: false, reden: 'fout' })

    expect(laatsteVlag()).toBeNull()
    expect(deleteClaim).toHaveBeenCalledWith('user_id', USER_ID)
  })

  it('draait de vlag terug als het versturen een fout gooit', async () => {
    send.mockRejectedValue(new Error('geen verbinding'))

    expect(await stuurWelkomstmail(USER_ID)).toEqual({ verstuurd: false, reden: 'fout' })

    expect(laatsteVlag()).toBeNull()
    expect(deleteClaim).toHaveBeenCalledWith('user_id', USER_ID)
  })

  it('houdt de overige metagegevens heel bij het terugdraaien', async () => {
    send.mockRejectedValue(new Error('geen verbinding'))

    await stuurWelkomstmail(USER_ID)

    expect(updateUserById.mock.calls.at(-1)?.[1]?.user_metadata?.username).toBe('Sanne')
  })

  // Dát de mail uitgaat, loopt `e2e/nieuwe-leerling.spec.ts` na met een neppe
  // Resend. Wat er precies in staat, controleren we hier: Nederlands, de
  // merknaam van deze site, en de link waar de leerling op moet klikken.
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
    expect(insertClaim).not.toHaveBeenCalled()
  })

  it('stuurt niets als een andere aanroep de mail net claimt', async () => {
    insertClaim.mockResolvedValue({
      error: { code: '23505', message: 'duplicate key' },
    })

    expect(await stuurWelkomstmail(USER_ID)).toEqual({
      verstuurd: false,
      reden: 'al-verstuurd',
    })

    expect(send).not.toHaveBeenCalled()
    expect(updateUserById).not.toHaveBeenCalled()
  })

  it('stuurt toch als de claim-tabel er nog niet is', async () => {
    insertClaim.mockResolvedValue({
      error: { code: 'PGRST205', message: 'welkomstmail_claim ontbreekt' },
    })

    expect(await stuurWelkomstmail(USER_ID)).toEqual({ verstuurd: true })

    expect(send).toHaveBeenCalledTimes(1)
    expect(deleteClaim).not.toHaveBeenCalled()
  })

  it('stuurt Aaf één seintje als de welkomstmail lukt', async () => {
    vi.stubEnv('NOTIFY_EMAIL', 'beheer@example.test')

    expect(await stuurWelkomstmail(USER_ID)).toEqual({ verstuurd: true })

    expect(send).toHaveBeenCalledTimes(2)
    const seintje = send.mock.calls[1][0]
    expect(seintje.to).toBe('beheer@example.test')
    expect(seintje.subject).toBe('Adres bevestigd op afgeleideoefenen.nl')
    expect(seintje.html).toContain('Leerling heeft zijn adres bevestigd')
    expect(seintje.html).toContain('leerling@example.test')
    expect(seintje.html).toContain('Sanne')
    expect(seintje.html).toContain(USER_ID)

    const gelogd = vi.mocked(console.error).mock.calls.flat().join(' ')
    expect(gelogd).not.toContain('leerling@example.test')
  })

  it('laat de welkomstmail staan als het seintje mislukt', async () => {
    vi.stubEnv('NOTIFY_EMAIL', 'beheer@example.test')
    send.mockImplementation(async (mail) =>
      mail.to === 'beheer@example.test'
        ? { error: { message: 'leerling@example.test geweigerd' } }
        : { error: null },
    )

    expect(await stuurWelkomstmail(USER_ID)).toEqual({ verstuurd: true })
    expect(laatsteVlag()).toEqual(expect.any(String))

    const gelogd = vi.mocked(console.error).mock.calls.flat().join(' ')
    expect(gelogd).toContain('[seintje bevestigd] versturen mislukt')
    expect(gelogd).not.toContain('leerling@example.test')
  })
})
