import { describe, expect, it } from 'vitest'

import { deelLink } from './deel-link'

describe('deelLink', () => {
  it('zet van=klas op een kale pagina', () => {
    expect(deelLink('/nl/theorie/machtsregel')).toBe('/nl/theorie/machtsregel?van=klas')
  })

  it('laat het hoofdstuk staan', () => {
    expect(deelLink('/nl/oefenen?chapter=h2')).toBe('/nl/oefenen?chapter=h2&van=klas')
  })
})
