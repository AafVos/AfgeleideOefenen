import { afterEach, describe, expect, it, vi } from 'vitest'

// =====================================================================
// Het volledige adres van deze aanvraag.
//
// Alleen de adresopbouw wordt getest: de headers zijn nep, er komt geen
// browser of server aan te pas.
// =====================================================================

const headerWaarden = new Map<string, string>()

vi.mock('next/headers', () => ({
  headers: async () => ({
    get: (naam: string) => headerWaarden.get(naam),
  }),
}))

const { bepaalAanvraagAdres } = await import('./aanvraag-adres')

describe('bepaalAanvraagAdres', () => {
  afterEach(() => headerWaarden.clear())

  it('neemt de origin-header over als die er is', async () => {
    headerWaarden.set('origin', 'http://localhost:3177')
    headerWaarden.set('x-forwarded-host', 'www.afgeleideoefenen.nl')

    expect(await bepaalAanvraagAdres()).toBe('http://localhost:3177')
  })

  it('zet https:// voor x-forwarded-host als origin ontbreekt', async () => {
    headerWaarden.set('x-forwarded-host', 'www.afgeleideoefenen.nl')

    expect(await bepaalAanvraagAdres()).toBe('https://www.afgeleideoefenen.nl')
  })

  it('gebruikt de host-header als ook x-forwarded-host ontbreekt', async () => {
    headerWaarden.set('host', 'www.afgeleideoefenen.nl')

    expect(await bepaalAanvraagAdres()).toBe('https://www.afgeleideoefenen.nl')
  })

  it('valt zonder headers terug op het adres uit de config', async () => {
    expect(await bepaalAanvraagAdres()).toBe('https://www.afgeleideoefenen.nl')
  })

  it('haalt een losse schuine streep aan het eind weg', async () => {
    headerWaarden.set('origin', 'http://localhost:3177/')

    expect(await bepaalAanvraagAdres()).toBe('http://localhost:3177')
  })
})