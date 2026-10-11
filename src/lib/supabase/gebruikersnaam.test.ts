import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

import type { Database } from './types'
import { zetGekozenGebruikersnaam } from './gebruikersnaam'

type Mocks = {
  from: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  is: ReturnType<typeof vi.fn>
}

function maakMockSupabase(
  updateError: { message: string } | null = null,
): { supabase: SupabaseClient<Database>; mocks: Mocks } {
  const is = vi.fn().mockResolvedValue({ error: updateError })
  const eq = vi.fn().mockReturnValue({ is })
  const update = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ update })

  const supabase = { from } as unknown as SupabaseClient<Database>

  return { supabase, mocks: { from, update, eq, is } }
}

function maakMockUser(metadata: Record<string, unknown> = {}): User {
  return {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    user_metadata: metadata,
  } as User
}

describe('zetGekozenGebruikersnaam', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('schrijft de gebruikersnaam naar profiles als die nog leeg is', async () => {
    const { supabase, mocks } = maakMockSupabase()
    const user = maakMockUser({ username: 'Sanne' })

    await zetGekozenGebruikersnaam(supabase, user)

    expect(mocks.from).toHaveBeenCalledWith('profiles')
    expect(mocks.update).toHaveBeenCalledWith({ username: 'Sanne' })
    expect(mocks.eq).toHaveBeenCalledWith('id', user.id)
    expect(mocks.is).toHaveBeenCalledWith('username', null)
  })

  it('trimt witruimte rond de naam', async () => {
    const { supabase, mocks } = maakMockSupabase()
    const user = maakMockUser({ username: '  Sanne  ' })

    await zetGekozenGebruikersnaam(supabase, user)

    expect(mocks.update).toHaveBeenCalledWith({ username: 'Sanne' })
  })

  it('slaat over als er geen gebruikersnaam in de metadata zit', async () => {
    const { supabase, mocks } = maakMockSupabase()
    const user = maakMockUser({})

    await zetGekozenGebruikersnaam(supabase, user)

    expect(mocks.from).not.toHaveBeenCalled()
  })

  it('slaat over als de gebruikersnaam leeg is', async () => {
    const { supabase, mocks } = maakMockSupabase()
    const user = maakMockUser({ username: '' })

    await zetGekozenGebruikersnaam(supabase, user)

    expect(mocks.from).not.toHaveBeenCalled()
  })

  it('slaat over als de gebruikersnaam alleen witruimte is', async () => {
    const { supabase, mocks } = maakMockSupabase()
    const user = maakMockUser({ username: '   ' })

    await zetGekozenGebruikersnaam(supabase, user)

    expect(mocks.from).not.toHaveBeenCalled()
  })

  it('logt een fout maar gooit niet bij een databasefout', async () => {
    const { supabase } = maakMockSupabase({ message: 'RLS denied' })
    const user = maakMockUser({ username: 'Sanne' })

    await expect(zetGekozenGebruikersnaam(supabase, user)).resolves.toBeUndefined()

    expect(console.error).toHaveBeenCalledWith(
      '[gebruikersnaam] kon gekozen naam niet naar profiles schrijven:',
      'RLS denied',
    )
  })

  it('schrijft alleen als username in profiles nog null is', async () => {
    const { supabase, mocks } = maakMockSupabase()
    const user = maakMockUser({ username: 'Sanne' })

    await zetGekozenGebruikersnaam(supabase, user)

    expect(mocks.is).toHaveBeenCalledWith('username', null)
  })

  it('werkt met een User zonder user_metadata', async () => {
    const { supabase, mocks } = maakMockSupabase()
    const user = { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' } as User

    await zetGekozenGebruikersnaam(supabase, user)

    expect(mocks.from).not.toHaveBeenCalled()
  })
})