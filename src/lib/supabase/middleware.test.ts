import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { updateSession } from './middleware'

const { gebruiker } = vi.hoisted(() => ({
  gebruiker: {
    id: 'u1',
    app_metadata: {} as Record<string, unknown>,
    user_metadata: {} as Record<string, unknown>,
    identities: [] as { provider?: string }[],
  },
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: gebruiker }, error: null }),
    },
  }),
}))

function verzoek(pad: string, koekje?: string) {
  const headers = new Headers()
  if (koekje) headers.set('cookie', koekje)
  return new NextRequest(`http://localhost${pad}`, { headers })
}

const SESSIE = 'sb-abc-auth-token=xyz'

describe('updateSession zonder sessie', () => {
  it('laat de startpagina door zonder omweg', async () => {
    const antwoord = await updateSession(verzoek('/nl'))
    expect(antwoord.status).toBe(200)
    expect(antwoord.headers.get('location')).toBeNull()
  })

  it('stuurt het dashboard naar inloggen', async () => {
    const antwoord = await updateSession(verzoek('/nl/dashboard'))
    expect(antwoord.headers.get('location')).toContain('/nl/inloggen')
  })

  it('bewaart een gekozen soort som op het inlogscherm', async () => {
    const antwoord = await updateSession(verzoek('/nl/oefenen?chapter=h2'))
    const locatie = antwoord.headers.get('location') ?? ''
    expect(locatie).toContain('/nl/inloggen')
    expect(locatie).toContain('naar=')
    expect(decodeURIComponent(locatie)).toContain('/oefenen')
  })

  it('ziet de tussenstap van Google niet als een sessie', async () => {
    const antwoord = await updateSession(
      verzoek('/nl/dashboard', 'sb-abc-auth-token-code-verifier=xyz'),
    )
    expect(antwoord.headers.get('location')).toContain('/nl/inloggen')
  })
})

describe('updateSession met sessie', () => {
  beforeEach(() => {
    gebruiker.app_metadata = {}
    gebruiker.user_metadata = {}
    gebruiker.identities = []
  })

  it('stuurt een ingelogde leerling van de startpagina naar het dashboard', async () => {
    const antwoord = await updateSession(verzoek('/nl', SESSIE))
    expect(antwoord.headers.get('location')).toContain('/nl/dashboard')
  })

  it('laat een ingelogde leerling op een theoriepagina', async () => {
    const antwoord = await updateSession(
      verzoek('/nl/theorie/kettingregel', SESSIE),
    )
    expect(antwoord.status).toBe(200)
    expect(antwoord.headers.get('location')).toBeNull()
  })

  it('stuurt een nieuwe Google-leerling eerst naar de gebruikersnaam', async () => {
    gebruiker.app_metadata = { provider: 'google' }
    const antwoord = await updateSession(verzoek('/nl', SESSIE))
    expect(antwoord.headers.get('location')).toContain('/nl/gebruikersnaam')
    expect(antwoord.headers.get('location')).not.toContain('/dashboard')
  })
})
