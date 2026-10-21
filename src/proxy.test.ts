import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { proxy } from './proxy'

function verzoek(pad: string) {
  return new NextRequest(`http://localhost${pad}`)
}

describe('taalcode', () => {
  it('stuurt / met één 301 naar /nl', async () => {
    const antwoord = await proxy(verzoek('/'))
    expect(antwoord.status).toBe(301)
    expect(antwoord.headers.get('location')).toBe('http://localhost/nl')
  })

  it('stuurt een adres zonder taalcode met 301 naar /nl', async () => {
    const antwoord = await proxy(verzoek('/theorie/kettingregel'))
    expect(antwoord.status).toBe(301)
    expect(antwoord.headers.get('location')).toBe(
      'http://localhost/nl/theorie/kettingregel',
    )
  })
})

describe('oude /en-adressen', () => {
  it('stuurt /en met 301 naar /nl', async () => {
    const antwoord = await proxy(verzoek('/en'))
    expect(antwoord.status).toBe(301)
    expect(antwoord.headers.get('location')).toBe('http://localhost/nl')
  })

  it('stuurt /en/uitleg-videos met 301 naar /nl/uitleg-videos', async () => {
    const antwoord = await proxy(verzoek('/en/uitleg-videos'))
    expect(antwoord.status).toBe(301)
    expect(antwoord.headers.get('location')).toBe(
      'http://localhost/nl/uitleg-videos',
    )
  })
})

describe('terugknop van de browser', () => {
  const zonderStore = 'private, no-cache, max-age=0, must-revalidate'

  it.each([
    '/nl/hoe-het-werkt',
    '/nl/privacy',
    '/nl/uitleg-videos',
    '/nl/uitleg-videos/quotientregel',
    '/nl/theorie',
    '/nl/theorie/machtsregel',
    '/nl/voorbeeld/wortel-x',
  ])('laat %s zonder no-store door', async (pad) => {
    const antwoord = await proxy(verzoek(pad))
    expect(antwoord.status).toBe(200)
    expect(antwoord.headers.get('cache-control')).toBe(zonderStore)
  })

  // De worker haalt `/persoonlijk` er normaal al af. Komt het adres er toch
  // zo langs, dan hoort de regel er net zo goed op te staan.
  it.each(['/nl/theorie/persoonlijk', '/nl/theorie/machtsregel/persoonlijk'])(
    'laat %s zonder no-store door',
    async (pad) => {
      const antwoord = await proxy(verzoek(pad))
      expect(antwoord.headers.get('cache-control')).toBe(zonderStore)
    },
  )

  it('laat /nl/inloggen met rust, want die zet Next zelf', async () => {
    const antwoord = await proxy(verzoek('/nl/inloggen'))
    expect(antwoord.headers.get('cache-control')).toBeNull()
  })

  it('geeft een pagina waar je voor moet inloggen geen eigen cache-regel', async () => {
    const antwoord = await proxy(verzoek('/nl/dashboard'))
    expect(antwoord.headers.get('cache-control')).toBeNull()
  })
})
