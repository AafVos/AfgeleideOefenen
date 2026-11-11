import { describe, expect, it } from 'vitest'

import { GET } from './route'

const TOP_VOORBEELDEN = [
  'ln-x',
  'een-gedeeld-door-x',
  'sin-x',
  'cos-x',
  'e-tot-de-x',
  'e-tot-de-2x',
  'wortel-x',
]

describe('llms.txt', () => {
  it('geeft tekst terug met de juiste content-type', async () => {
    const antwoord = GET()
    expect(antwoord.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(antwoord.status).toBe(200)
  })

  it('bevat alle afgesproken voorbeeldlinks, elk met een /nl/-adres', async () => {
    const tekst = await GET().text()
    for (const slug of TOP_VOORBEELDEN) {
      expect(tekst).toContain(`https://www.afgeleideoefenen.nl/nl/voorbeeld/${slug}`)
    }
  })

  it('bevat theoriepagina s naast de voorbeelden', async () => {
    const tekst = await GET().text()
    expect(tekst).toContain('/nl/theorie/kettingregel')
    expect(tekst).toContain('/nl/theorie/productregel')
  })

  it('verwijst naar de zustersites en het YouTube-kanaal, zonder tracking of login-only paden', async () => {
    const tekst = await GET().text()
    expect(tekst).toContain('https://integraaloefenen.nl/?van=afgeleideoefenen')
    expect(tekst).toContain('https://www.wiskundemetaaf.nl')
    expect(tekst).toContain('https://www.youtube.com/@WiskundeMetAaf')
    expect(tekst).not.toContain('/oefenen')
    expect(tekst).not.toContain('utm_')
  })
})
