import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const db = vi.hoisted(() => ({
  inlogFout: null as { message: string } | null,
}))

vi.mock('next/cache', () => ({
  revalidatePath: () => {},
}))

vi.mock('next/server', () => ({
  after: () => {},
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
}))

vi.mock('next-intl/server', () => ({
  getLocale: async () => 'nl',
}))

vi.mock('@/lib/auth/bestemming', () => ({
  bestemmingNaInloggen: async () => '/nl/oefenen',
}))

vi.mock('@/lib/auth/bevestigingslink', () => ({
  bevestigingsRedirect: async () => 'https://afgeleideoefenen.nl/nl/auth/callback',
}))

vi.mock('@/lib/auth/google', () => ({
  gebruikersnaamBestemming: () => '/nl/gebruikersnaam',
  moetNaamVragen: () => false,
}))

vi.mock('@/lib/email/welkom', () => ({
  stuurWelkomstmail: async () => ({ verstuurd: false, reden: 'geen-sleutel' }),
}))

vi.mock('@/lib/supabase/gebruikersnaam', () => ({
  zetGekozenGebruikersnaam: async () => {},
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      signInWithPassword: async () => ({ data: { user: null }, error: db.inlogFout }),
    },
  }),
}))

const { loginAction } = await import('./actions')

const leeg = { errorKey: null }

function formulier(velden: Record<string, string>): FormData {
  const data = new FormData()
  for (const [sleutel, waarde] of Object.entries(velden)) data.set(sleutel, waarde)
  return data
}

beforeEach(() => {
  db.inlogFout = null
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('loginAction', () => {
  it('geeft het ingevulde e-mailadres terug bij een onjuiste combinatie, zodat het formulier het laat staan', async () => {
    db.inlogFout = { message: 'Invalid login credentials' }

    const result = await loginAction(
      leeg,
      formulier({ email: 'leerling@test.local', password: 'fout-wachtwoord' }),
    )

    expect(result.errorKey).toBe('errorInvalidCredentials')
    expect(result.values).toEqual({ email: 'leerling@test.local' })
  })

  it('geeft het ingevulde e-mailadres ook terug als een veld ontbreekt', async () => {
    const result = await loginAction(leeg, formulier({ email: 'leerling@test.local', password: '' }))

    expect(result.errorKey).toBe('errorMissingFields')
    expect(result.values).toEqual({ email: 'leerling@test.local' })
  })
})
