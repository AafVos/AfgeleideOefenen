import { describe, expect, it } from 'vitest'

import { anoniemeStartpagina, anoniemeTheorieBestand } from './startpagina-snel'

function verzoek(
  pad: string,
  init?: { method?: string; headers?: Record<string, string> },
) {
  return new Request(`https://www.afgeleideoefenen.nl${pad}`, init)
}

describe('anoniemeStartpagina', () => {
  it('geldt voor een gewoon bezoek aan de startpagina', () => {
    expect(anoniemeStartpagina(verzoek('/nl'))).toBe(true)
    expect(anoniemeStartpagina(verzoek('/nl/'))).toBe(true)
    expect(anoniemeStartpagina(verzoek('/nl', { method: 'HEAD' }))).toBe(true)
  })

  it('geldt niet voor andere pagina’s, een zoekopdracht of een formulier', () => {
    expect(anoniemeStartpagina(verzoek('/nl/theorie'))).toBe(false)
    expect(anoniemeStartpagina(verzoek('/'))).toBe(false)
    expect(anoniemeStartpagina(verzoek('/nl?uitleg=1'))).toBe(false)
    expect(anoniemeStartpagina(verzoek('/nl', { method: 'POST' }))).toBe(false)
  })

  it('geldt niet als de app de pagina zelf opvraagt', () => {
    expect(
      anoniemeStartpagina(verzoek('/nl', { headers: { rsc: '1' } })),
    ).toBe(false)
    expect(
      anoniemeStartpagina(
        verzoek('/nl', { headers: { 'next-router-prefetch': '1' } }),
      ),
    ).toBe(false)
  })

  it('geldt niet als er een sessiekoekje is', () => {
    expect(
      anoniemeStartpagina(
        verzoek('/nl', {
          headers: { cookie: 'sb-project-auth-token=geheim' },
        }),
      ),
    ).toBe(false)
    expect(
      anoniemeStartpagina(
        verzoek('/nl', {
          headers: { cookie: 'sb-project-auth-token.0=a; thema=licht' },
        }),
      ),
    ).toBe(false)
  })

  it('negeert de tussenstap van Google', () => {
    expect(
      anoniemeStartpagina(
        verzoek('/nl', {
          headers: { cookie: 'sb-project-auth-token-code-verifier=x' },
        }),
      ),
    ).toBe(true)
  })
})

describe('anoniemeTheorieBestand', () => {
  it('wijst een gewoon bezoek naar het klaargezette bestand', () => {
    expect(anoniemeTheorieBestand(verzoek('/nl/theorie'))).toBe('index.html')
    expect(anoniemeTheorieBestand(verzoek('/nl/theorie/'))).toBe('index.html')
    expect(anoniemeTheorieBestand(verzoek('/nl/theorie/kettingregel'))).toBe(
      'kettingregel.html',
    )
    expect(anoniemeTheorieBestand(verzoek('/nl/theorie/extreme-waarden/'))).toBe(
      'extreme-waarden.html',
    )
    expect(
      anoniemeTheorieBestand(verzoek('/nl/theorie/kettingregel', { method: 'HEAD' })),
    ).toBe('kettingregel.html')
  })

  it('geldt niet voor de startpagina, een dieper pad of een zoekopdracht', () => {
    expect(anoniemeTheorieBestand(verzoek('/nl'))).toBeNull()
    expect(anoniemeTheorieBestand(verzoek('/nl/theorie/kettingregel/extra'))).toBeNull()
    expect(anoniemeTheorieBestand(verzoek('/nl/theorie/Kettingregel'))).toBeNull()
    expect(anoniemeTheorieBestand(verzoek('/nl/theorie/kettingregel?uitleg=1'))).toBeNull()
    expect(
      anoniemeTheorieBestand(verzoek('/nl/theorie/kettingregel', { method: 'POST' })),
    ).toBeNull()
  })

  it('geldt niet als de app de pagina zelf opvraagt', () => {
    expect(
      anoniemeTheorieBestand(
        verzoek('/nl/theorie/kettingregel', { headers: { rsc: '1' } }),
      ),
    ).toBeNull()
    expect(
      anoniemeTheorieBestand(
        verzoek('/nl/theorie/kettingregel', {
          headers: { 'next-router-prefetch': '1' },
        }),
      ),
    ).toBeNull()
  })

  it('geldt niet als er een sessiekoekje is', () => {
    expect(
      anoniemeTheorieBestand(
        verzoek('/nl/theorie/kettingregel', {
          headers: { cookie: 'sb-project-auth-token=geheim' },
        }),
      ),
    ).toBeNull()
  })

  it('negeert de tussenstap van Google', () => {
    expect(
      anoniemeTheorieBestand(
        verzoek('/nl/theorie/kettingregel', {
          headers: { cookie: 'sb-project-auth-token-code-verifier=x' },
        }),
      ),
    ).toBe('kettingregel.html')
  })
})
