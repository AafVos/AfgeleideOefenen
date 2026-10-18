import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const db = vi.hoisted(() => ({
  user: { id: 'u1' } as { id: string } | null,
  locale: 'nl',
  profielFout: null as { code: string; message: string } | null,
  metaFout: null as { message: string } | null,
  updates: [] as unknown[],
  meta: [] as unknown[],
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

vi.mock('@/lib/auth/bestemming', () => ({
  bestemmingNaBevestigen: async () => '/nl/oefenen?q=abc',
}))

vi.mock('@/lib/email/welkom', () => ({
  stuurWelkomstmail: async () => ({ verstuurd: false, reden: 'geen-sleutel' }),
}))

// `requireUser()` haalt de gebruiker hierlangs op en bepaalt de taal van de
// redirect met `getLocale()`.
vi.mock('next-intl/server', () => ({
  getLocale: async () => db.locale,
}))

vi.mock('@/lib/supabase/request-cache', () => ({
  getCurrentUser: async () => db.user,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      updateUser: async (arg: unknown) => {
        db.meta.push(arg)
        return { error: db.metaFout }
      },
    },
    from: () => ({
      update: (waarden: unknown) => {
        db.updates.push(waarden)
        return {
          eq: async () => ({ error: db.profielFout }),
        }
      },
    }),
  }),
}))

const { kiesNaamAction } = await import('./actions')

const leeg = { errorKey: null }

function formulier(velden: Record<string, string>): FormData {
  const data = new FormData()
  for (const [sleutel, waarde] of Object.entries(velden)) data.set(sleutel, waarde)
  return data
}

beforeEach(() => {
  db.user = { id: 'u1' }
  db.locale = 'nl'
  db.profielFout = null
  db.metaFout = null
  db.updates = []
  db.meta = []
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('kiesNaamAction', () => {
  it('slaat een lege naam over en gaat door naar de eerste som', async () => {
    await expect(kiesNaamAction(leeg, formulier({ username: '   ' }))).rejects.toThrow(
      'REDIRECT:/nl/oefenen?q=abc',
    )
    expect(db.updates).toEqual([])
    expect(db.meta).toEqual([{ data: { google_naam_gevraagd: true } }])
  })

  it('bewaart een gekozen naam', async () => {
    await expect(kiesNaamAction(leeg, formulier({ username: 'Sanne' }))).rejects.toThrow(
      'REDIRECT:/nl/oefenen?q=abc',
    )
    expect(db.updates).toEqual([{ username: 'Sanne' }])
    expect(db.meta).toEqual([{ data: { username: 'Sanne', google_naam_gevraagd: true } }])
  })

  it('weigert een naam langer dan 40 tekens', async () => {
    const result = await kiesNaamAction(leeg, formulier({ username: 'a'.repeat(41) }))
    expect(result.errorKey).toBe('errorTeLang')
    expect(db.updates).toEqual([])
  })

  it('stuurt een uitgelogde leerling naar het inlogscherm in zijn eigen taal', async () => {
    db.user = null
    db.locale = 'en'

    await expect(kiesNaamAction(leeg, formulier({ username: 'Sanne' }))).rejects.toThrow(
      'REDIRECT:/en/inloggen',
    )
    expect(db.updates).toEqual([])
    expect(db.meta).toEqual([])
  })

  it('zet een dubbele naam om in een Nederlandse sleutel', async () => {
    db.profielFout = {
      code: '23505',
      message: 'duplicate key value violates unique constraint "profiles_username_key"',
    }

    const result = await kiesNaamAction(leeg, formulier({ username: 'anna' }))

    expect(result).toEqual({ errorKey: 'errorBezet', username: 'anna' })
    expect(JSON.stringify(result)).not.toContain('profiles_username_key')
    expect(db.meta).toEqual([])
  })
})
