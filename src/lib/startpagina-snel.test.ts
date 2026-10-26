import { describe, expect, it } from 'vitest'

import {
  anoniemeInloggenPagina,
  anoniemeRegistrerenPagina,
  anoniemeStartpagina,
  anoniemeTheorieBestand,
  anoniemeUitlegVideosPagina,
  anoniemeVoorbeeldBestand,
  statischZonderPersoonlijk,
} from './startpagina-snel'

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

  it('geldt niet voor het adres van een ingelogde leerling', () => {
    expect(anoniemeTheorieBestand(verzoek('/nl/theorie/persoonlijk'))).toBeNull()
  })
})

describe('anoniemeUitlegVideosPagina', () => {
  it('geldt voor een gewoon bezoek aan het overzicht', () => {
    expect(anoniemeUitlegVideosPagina(verzoek('/nl/uitleg-videos'))).toBe(true)
    expect(anoniemeUitlegVideosPagina(verzoek('/nl/uitleg-videos/'))).toBe(true)
  })

  it('geldt niet voor een losse video, een zoekopdracht of een sessiekoekje', () => {
    expect(anoniemeUitlegVideosPagina(verzoek('/nl/uitleg-videos/kettingregel'))).toBe(
      false,
    )
    expect(anoniemeUitlegVideosPagina(verzoek('/nl/uitleg-videos?video=1'))).toBe(false)
    expect(
      anoniemeUitlegVideosPagina(
        verzoek('/nl/uitleg-videos', {
          headers: { cookie: 'sb-project-auth-token=geheim' },
        }),
      ),
    ).toBe(false)
  })

  it('geldt niet voor het adres van een ingelogde leerling', () => {
    expect(anoniemeUitlegVideosPagina(verzoek('/nl/uitleg-videos/persoonlijk'))).toBe(
      false,
    )
  })
})

describe('anoniemeInloggenPagina', () => {
  it('geldt voor een kaal bezoek aan de inlogpagina', () => {
    expect(anoniemeInloggenPagina(verzoek('/nl/inloggen'))).toBe(true)
    expect(anoniemeInloggenPagina(verzoek('/nl/inloggen/'))).toBe(true)
  })

  it('geldt niet met een terugkeerpad, een foutmelding of een sessiekoekje', () => {
    expect(anoniemeInloggenPagina(verzoek('/nl/inloggen?naar=%2Foefenen'))).toBe(false)
    expect(anoniemeInloggenPagina(verzoek('/nl/inloggen?error=google_afgebroken'))).toBe(
      false,
    )
    expect(anoniemeInloggenPagina(verzoek('/nl/inloggen?mail=bevestigd'))).toBe(false)
    expect(
      anoniemeInloggenPagina(
        verzoek('/nl/inloggen', {
          headers: { cookie: 'sb-project-auth-token=geheim' },
        }),
      ),
    ).toBe(false)
  })
})

describe('anoniemeRegistrerenPagina', () => {
  it('geldt voor een kaal bezoek aan de registratiepagina', () => {
    expect(anoniemeRegistrerenPagina(verzoek('/nl/registreren'))).toBe(true)
    expect(anoniemeRegistrerenPagina(verzoek('/nl/registreren/'))).toBe(true)
  })

  it('geldt niet met een herkomstcode, een terugkeerpad of een sessiekoekje', () => {
    expect(anoniemeRegistrerenPagina(verzoek('/nl/registreren?van=youtube'))).toBe(false)
    expect(
      anoniemeRegistrerenPagina(verzoek('/nl/registreren?naar=%2Foefenen')),
    ).toBe(false)
    expect(
      anoniemeRegistrerenPagina(
        verzoek('/nl/registreren', {
          headers: { cookie: 'sb-project-auth-token=geheim' },
        }),
      ),
    ).toBe(false)
  })
})

describe('anoniemeVoorbeeldBestand', () => {
  it('wijst een gewoon bezoek naar het klaargezette bestand', () => {
    expect(anoniemeVoorbeeldBestand(verzoek('/nl/voorbeeld/wortel-x'))).toBe(
      'wortel-x.html',
    )
    expect(anoniemeVoorbeeldBestand(verzoek('/nl/voorbeeld/wortel-x/'))).toBe(
      'wortel-x.html',
    )
  })

  it('geldt niet voor een dieper pad, een zoekopdracht of een sessiekoekje', () => {
    expect(anoniemeVoorbeeldBestand(verzoek('/nl/voorbeeld'))).toBeNull()
    expect(anoniemeVoorbeeldBestand(verzoek('/nl/voorbeeld/wortel-x/extra'))).toBeNull()
    expect(anoniemeVoorbeeldBestand(verzoek('/nl/voorbeeld/wortel-x?uitleg=1'))).toBeNull()
    expect(
      anoniemeVoorbeeldBestand(
        verzoek('/nl/voorbeeld/wortel-x', {
          headers: { cookie: 'sb-project-auth-token=geheim' },
        }),
      ),
    ).toBeNull()
  })

  it('geldt niet voor het adres van een ingelogde leerling', () => {
    expect(anoniemeVoorbeeldBestand(verzoek('/nl/voorbeeld/persoonlijk'))).toBeNull()
  })
})

describe('statischZonderPersoonlijk', () => {
  it('haalt het extra stuk van een theorie-adres af', () => {
    expect(statischZonderPersoonlijk('/nl/theorie/persoonlijk')).toBe('/nl/theorie')
    expect(statischZonderPersoonlijk('/nl/theorie/kettingregel/persoonlijk')).toBe(
      '/nl/theorie/kettingregel',
    )
  })

  it('haalt het extra stuk van de uitlegvideo’s en een voorbeeld af', () => {
    expect(statischZonderPersoonlijk('/nl/uitleg-videos/persoonlijk')).toBe(
      '/nl/uitleg-videos',
    )
    expect(statischZonderPersoonlijk('/nl/voorbeeld/wortel-x/persoonlijk')).toBe(
      '/nl/voorbeeld/wortel-x',
    )
  })

  it('laat andere adressen met rust', () => {
    expect(statischZonderPersoonlijk('/nl/theorie/kettingregel')).toBeNull()
    expect(statischZonderPersoonlijk('/nl/oefenen/persoonlijk')).toBeNull()
    expect(statischZonderPersoonlijk('/nl/theorie/kettingregel/extra/persoonlijk')).toBeNull()
    expect(statischZonderPersoonlijk('/nl/voorbeeld/persoonlijk')).toBeNull()
  })
})
