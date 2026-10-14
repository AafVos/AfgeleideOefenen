import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const db = vi.hoisted(() => ({
  profielFout: null as { code: string; message: string } | null,
  wachtwoordFout: null as { message: string } | null,
}))

vi.mock('next/cache', () => ({
  revalidatePath: () => {},
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: 'u1' } } }),
      updateUser: async () => ({ error: db.wachtwoordFout }),
    },
    from: () => {
      const keten = {
        update: () => keten,
        eq: async () => ({ error: db.profielFout }),
      }
      return keten
    },
  }),
}))

const { updatePasswordAction, updateUsernameAction } = await import('./actions')

const leeg = { error: null, success: null }

function formulier(velden: Record<string, string>): FormData {
  const data = new FormData()
  for (const [sleutel, waarde] of Object.entries(velden)) data.set(sleutel, waarde)
  return data
}

beforeEach(() => {
  db.profielFout = null
  db.wachtwoordFout = null
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('updateUsernameAction', () => {
  it('zet een dubbele gebruikersnaam om in een Nederlandse zin', async () => {
    const ruw = 'duplicate key value violates unique constraint "profiles_username_key"'
    db.profielFout = { code: '23505', message: ruw }

    const result = await updateUsernameAction(leeg, formulier({ username: 'anna' }))

    expect(result).toEqual({
      error: 'Die gebruikersnaam is al in gebruik. Kies een andere.',
      success: null,
    })
    expect(JSON.stringify(result)).not.toContain('profiles_username_key')
    expect(vi.mocked(console.error).mock.calls.flat().join(' ')).toContain(
      'profiles_username_key',
    )
  })
})

describe('updatePasswordAction', () => {
  it('toont geen Engels als Supabase het wachtwoord afkeurt', async () => {
    db.wachtwoordFout = { message: 'Password should be at least 8 characters' }

    const result = await updatePasswordAction(
      leeg,
      formulier({ password: 'geheim12', passwordConfirm: 'geheim12' }),
    )

    expect(result.error).toBe('Kies een sterker wachtwoord (minstens 8 tekens).')
    expect(result.error).not.toMatch(/Password/)
    expect(vi.mocked(console.error).mock.calls.flat().join(' ')).toContain(
      'Password should be at least 8 characters',
    )
  })

  it('houdt de zin als het nieuwe wachtwoord hetzelfde is', async () => {
    db.wachtwoordFout = {
      message: 'New password should be different from the old password.',
    }

    const result = await updatePasswordAction(
      leeg,
      formulier({ password: 'geheim12', passwordConfirm: 'geheim12' }),
    )

    expect(result.error).toBe(
      'Het nieuwe wachtwoord moet anders zijn dan je huidige wachtwoord.',
    )
    expect(result.error).not.toMatch(/password/i)
  })
})
