import { describe, expect, it } from 'vitest'

import { anoniemeStartpagina } from './startpagina-snel'

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
