import { afterEach, describe, expect, it, vi } from 'vitest'

// =====================================================================
// De link in de bevestigingsmail.
//
// De headers zijn nep; er komt geen server, geen mail en geen Supabase
// aan te pas. Het gaat erom dat het gekozen oefenpad meegaat en dat een
// ander pad er niet in komt.
// =====================================================================

const headerWaarden = new Map<string, string>()

vi.mock('next/headers', () => ({
  headers: async () => ({
    get: (naam: string) => headerWaarden.get(naam),
  }),
}))

const { bevestigingsRedirect } = await import('./bevestigingslink')

describe('bevestigingsRedirect', () => {
  afterEach(() => headerWaarden.clear())

  it('wijst zonder gekozen soort naar inloggen', async () => {
    headerWaarden.set('origin', 'http://localhost:3177')

    expect(await bevestigingsRedirect(null, 'nl')).toBe(
      'http://localhost:3177/auth/callback?next=%2Fnl%2Finloggen',
    )
  })

  it('neemt het gekozen oefenpad mee', async () => {
    headerWaarden.set('origin', 'http://localhost:3177')

    expect(await bevestigingsRedirect('/oefenen?topic=machten', 'nl')).toBe(
      'http://localhost:3177/auth/callback?next=%2Foefenen%3Ftopic%3Dmachten',
    )
  })

  it('codeert het hele pad, zodat een & er niet uit valt', async () => {
    headerWaarden.set('origin', 'https://www.afgeleideoefenen.nl')

    const link = await bevestigingsRedirect('/oefenen?chapter=ch1&topic=machten', 'nl')

    expect(link).toBe(
      'https://www.afgeleideoefenen.nl/auth/callback?next=%2Foefenen%3Fchapter%3Dch1%26topic%3Dmachten',
    )
    expect(new URL(link).searchParams.get('next')).toBe('/oefenen?chapter=ch1&topic=machten')
  })

  it('laat een pad buiten het oefenen niet mee', async () => {
    headerWaarden.set('origin', 'http://localhost:3177')

    expect(await bevestigingsRedirect('/admin/users', 'nl')).toBe(
      'http://localhost:3177/auth/callback?next=%2Fnl%2Finloggen',
    )
  })

  it('laat een adres buiten de site niet mee', async () => {
    headerWaarden.set('origin', 'http://localhost:3177')

    expect(await bevestigingsRedirect('https://ergens-anders.nl/oefenen', 'nl')).toBe(
      'http://localhost:3177/auth/callback?next=%2Fnl%2Finloggen',
    )
  })

  it('gebruikt het adres waarop de leerling de site bereikt', async () => {
    headerWaarden.set('x-forwarded-host', 'www.afgeleideoefenen.nl')

    expect(await bevestigingsRedirect(null, 'nl')).toBe(
      'https://www.afgeleideoefenen.nl/auth/callback?next=%2Fnl%2Finloggen',
    )
  })
})
