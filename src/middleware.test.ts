import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { middleware } from './middleware'

function verzoek(pad: string) {
  return new NextRequest(`http://localhost${pad}`)
}

describe('taalcode', () => {
  it('stuurt / permanent naar /nl', async () => {
    const antwoord = await middleware(verzoek('/'))
    expect(antwoord.status).toBe(308)
    expect(antwoord.headers.get('location')).toBe('http://localhost/nl')
  })

  it('stuurt een adres zonder taalcode permanent naar /nl', async () => {
    const antwoord = await middleware(verzoek('/theorie/kettingregel'))
    expect(antwoord.status).toBe(308)
    expect(antwoord.headers.get('location')).toBe(
      'http://localhost/nl/theorie/kettingregel',
    )
  })
})
