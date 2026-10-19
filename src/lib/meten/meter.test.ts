/**
 * Het meetscriptje aan het werk, met een nagemaakte browser eromheen.
 *
 * De rest van de meting is pure rekenwerk en wordt los getest. Hier gaat het
 * om de bedrading: komt een geslaagde aanmelding ook echt als één
 * `registratie` de deur uit? Dat is precies wat er misging — de melding viel
 * tussen wal en schip — dus dat is het waard om na te lopen zonder er een
 * echte browser bij te halen.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { geldigeZending, type Gebeurtenis } from './gebeurtenis'
import { meldMeting, pikRegistratieUitAdres } from './melden'
import { startMeten } from './meter'

type Luisteraar = (gebeurtenis: unknown) => void

/** Een browsertje van niks: net genoeg voor `startMeten`. */
function nepBrowser(pad: string, zoek: string) {
  const opslag = new Map<string, string>()
  return maakBrowser(pad, zoek, opslag)
}

function maakBrowser(pad: string, zoek: string, opslag: Map<string, string>) {
  const verzonden: Gebeurtenis[][] = []
  const luisteraars = new Map<string, Luisteraar[]>()

  const luister = (naam: string, hoe: Luisteraar) => {
    luisteraars.set(naam, [...(luisteraars.get(naam) ?? []), hoe])
  }
  const vergeet = (naam: string, hoe: Luisteraar) => {
    luisteraars.set(naam, (luisteraars.get(naam) ?? []).filter((l) => l !== hoe))
  }

  const location = {
    hostname: 'afgeleideoefenen.nl',
    pathname: pad,
    search: zoek,
    hash: '',
  }

  const window = {
    location,
    innerWidth: 1280,
    sessionStorage: {
      getItem: (sleutel: string) => opslag.get(sleutel) ?? null,
      setItem: (sleutel: string, waarde: string) => void opslag.set(sleutel, waarde),
      removeItem: (sleutel: string) => void opslag.delete(sleutel),
    },
    history: {
      state: null,
      // Net als de echte: het pad plus wat er van de zoekreeks overblijft.
      replaceState: (_staat: unknown, _titel: string, adres: string) => {
        const [nieuwPad, rest] = adres.split('?')
        location.pathname = nieuwPad
        location.search = rest ? `?${rest}` : ''
      },
    },
    addEventListener: luister,
    removeEventListener: vergeet,
    dispatchEvent: (gebeurtenis: { type: string }) => {
      for (const hoe of luisteraars.get(gebeurtenis.type) ?? []) hoe(gebeurtenis)
      return true
    },
    // De klok laten we met rust: `verstuur` wordt in deze tests zelf
    // aangeroepen, en de scrollmeting hoort hier niet bij.
    setInterval: () => 0,
    clearInterval: () => {},
    setTimeout: () => 0,
    requestAnimationFrame: () => 0,
  }

  const document = {
    referrer: '',
    addEventListener: luister,
    removeEventListener: vergeet,
    querySelector: () => null,
    visibilityState: 'visible',
  }

  const navigator = {
    webdriver: false,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131 Safari/537.36',
    // Geen sendBeacon: dan valt `verstuur` terug op fetch, en dat is hier
    // makkelijker te lezen.
    sendBeacon: undefined,
  }

  return { window, document, navigator, verzonden, opslag }
}

type Browser = ReturnType<typeof maakBrowser>

const echt = {
  window: (globalThis as Record<string, unknown>).window,
  document: (globalThis as Record<string, unknown>).document,
  navigator: Object.getOwnPropertyDescriptor(globalThis, 'navigator'),
  fetch: globalThis.fetch,
}

function zetNeer(browser: Browser) {
  Object.defineProperty(globalThis, 'window', {
    value: browser.window,
    configurable: true,
    writable: true,
  })
  Object.defineProperty(globalThis, 'document', {
    value: browser.document,
    configurable: true,
    writable: true,
  })
  Object.defineProperty(globalThis, 'navigator', {
    value: browser.navigator,
    configurable: true,
    writable: true,
  })
  globalThis.fetch = (async (_adres: string, opties: { body: string }) => {
    browser.verzonden.push(JSON.parse(opties.body))
    return new Response(null, { status: 204 })
  }) as unknown as typeof fetch
}

afterEach(() => {
  Object.defineProperty(globalThis, 'window', {
    value: echt.window,
    configurable: true,
    writable: true,
  })
  Object.defineProperty(globalThis, 'document', {
    value: echt.document,
    configurable: true,
    writable: true,
  })
  if (echt.navigator) Object.defineProperty(globalThis, 'navigator', echt.navigator)
  globalThis.fetch = echt.fetch
})

/** Alle gebeurtenissen die de deur uit gingen, op volgorde. */
function alles(browser: Browser): Gebeurtenis[] {
  return browser.verzonden.flat()
}

function registraties(browser: Browser): Gebeurtenis[] {
  return alles(browser).filter((g) => g.soort === 'registratie')
}

describe('terugkeer van "Doorgaan met Google"', () => {
  let browser: Browser

  beforeEach(() => {
    browser = nepBrowser('/nl/gebruikersnaam', '?naar=%2Foefenen&nieuw=google')
    zetNeer(browser)
  })

  it('telt precies één registratie, met doel registratie-via-google', () => {
    const meter = startMeten()
    expect(meter).not.toBe(null)
    meter?.stop()

    expect(registraties(browser)).toHaveLength(1)
    expect(registraties(browser)[0].doel).toBe('registratie-via-google')
    expect(registraties(browser)[0].pad).toBe('/nl/gebruikersnaam')
  })

  it('stuurt een rij die de controle van /api/meet ook doorlaat', () => {
    startMeten()?.stop()

    // Wat de browser verstuurt gaat bij binnenkomst nog een keer langs
    // `geldigeZending`. Zo weten we dat de registratie daar niet alsnog
    // afvalt — anders staat hij wel in het tabblad en niet in de tabel.
    const doorgelaten = browser.verzonden.flatMap((pakket) => geldigeZending(pakket))
    const gemeten = doorgelaten.filter((g) => g.soort === 'registratie')

    expect(gemeten).toHaveLength(1)
    expect(gemeten[0].doel).toBe('registratie-via-google')
    // De parameter hoort niet in het gemeten pad terecht te komen.
    expect(gemeten[0].pad).toBe('/nl/gebruikersnaam')
  })

  it('haalt de parameter uit de adresregel, maar laat de rest staan', () => {
    startMeten()?.stop()

    expect(browser.window.location.search).toBe('?naar=%2Foefenen')
  })

  it('telt er bij herladen van dezelfde pagina geen tweede', () => {
    startMeten()?.stop()
    expect(registraties(browser)).toHaveLength(1)

    // Zelfde tabblad, zelfde adres: de leerling drukt op verversen. De
    // parameter staat er in de praktijk niet meer, maar via de terugknop kan
    // hij terugkomen — ook dan telt hij niet opnieuw.
    const opnieuw = maakBrowser(
      '/nl/gebruikersnaam',
      '?naar=%2Foefenen&nieuw=google',
      browser.opslag,
    )
    zetNeer(opnieuw)
    startMeten()?.stop()

    expect(registraties(opnieuw)).toHaveLength(0)
  })

  it('telt hem alsnog als de leerling al doorgeklikt is naar een andere pagina', () => {
    // Het meetscriptje laadt pas als de browser klaar is met tekenen. Doet de
    // pagina daarvóór al een stap verder, dan is de adresregel weg — maar de
    // aanmelding staat opzij.
    pikRegistratieUitAdres()

    const verder = maakBrowser('/nl/oefenen', '', browser.opslag)
    zetNeer(verder)
    startMeten()?.stop()

    expect(registraties(verder)).toHaveLength(1)
    expect(registraties(verder)[0].doel).toBe('registratie-via-google')
  })
})

describe('melding uit het registratieformulier', () => {
  it('telt één registratie als de meter al luistert', () => {
    const browser = nepBrowser('/nl/registreren', '')
    zetNeer(browser)

    const meter = startMeten()
    meldMeting('registratie', 'registratie-via-proefsom')
    meter?.stop()

    expect(registraties(browser)).toHaveLength(1)
    expect(registraties(browser)[0].doel).toBe('registratie-via-proefsom')
  })

  it('telt hem ook als hij komt voordat de meter er is', () => {
    const browser = nepBrowser('/nl/registreren', '')
    zetNeer(browser)

    meldMeting('registratie', 'registratie-via-proefsom')
    startMeten()?.stop()

    expect(registraties(browser)).toHaveLength(1)
    expect(registraties(browser)[0].doel).toBe('registratie-via-proefsom')
  })

  it('telt een dubbele melding maar één keer', () => {
    const browser = nepBrowser('/nl/registreren', '')
    zetNeer(browser)

    const meter = startMeten()
    meldMeting('registratie', 'registratie-via-proefsom')
    meldMeting('registratie', 'registratie-via-proefsom')
    meter?.stop()

    expect(registraties(browser)).toHaveLength(1)
  })
})
