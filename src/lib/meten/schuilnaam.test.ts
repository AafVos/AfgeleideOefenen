import { describe, expect, it } from 'vitest'

import { schuilnaam, SCHUILNAAM_LENGTE } from './schuilnaam'

const GEBRUIKER = '11111111-1111-1111-1111-111111111111'
const GEHEIM = 'proef-geheim-niet-echt'

describe('schuilnaam', () => {
  /**
   * Deze uitkomst komt uit de database zelf:
   *
   *   select left(encode(extensions.hmac(
   *     '11111111-1111-1111-1111-111111111111',
   *     'proef-geheim-niet-echt', 'sha256'), 'hex'), 16);
   *
   * Rekent de site anders dan `meet_schuilnaam()` uit migratie 0073, dan
   * sluiten de overzichten van de analist niet meer aan op de meting.
   */
  it('rekent hetzelfde uit als de database', async () => {
    expect(await schuilnaam(GEBRUIKER, GEHEIM)).toBe('0cb66a76537cbfb0')
  })

  it('is altijd 16 tekens hex', async () => {
    const naam = await schuilnaam(GEBRUIKER, GEHEIM)
    expect(naam).toHaveLength(SCHUILNAAM_LENGTE)
    expect(naam).toMatch(/^[0-9a-f]+$/)
  })

  it('geeft een andere leerling een andere schuilnaam', async () => {
    const ander = await schuilnaam('22222222-2222-2222-2222-222222222222', GEHEIM)
    expect(ander).not.toBe(await schuilnaam(GEBRUIKER, GEHEIM))
  })

  it('verandert mee als het geheim verandert', async () => {
    expect(await schuilnaam(GEBRUIKER, 'ander geheim')).not.toBe(
      await schuilnaam(GEBRUIKER, GEHEIM),
    )
  })

  it('geeft niets zonder gebruiker of zonder geheim', async () => {
    expect(await schuilnaam(null, GEHEIM)).toBeNull()
    expect(await schuilnaam(GEBRUIKER, undefined)).toBeNull()
    expect(await schuilnaam('', '')).toBeNull()
  })
})
