import { describe, expect, it } from 'vitest'

import { volgVensterHoogte, type Vensterachtig } from './viewport-hoogte'

/** Neppe window/visualViewport: alleen wat volgVensterHoogte nodig heeft. */
function nepVenster(
  startHoogte: number,
): Omit<Vensterachtig, 'innerHeight'> & {
  innerHeight: number
  vuurResize: () => void
  luisteraars: number
} {
  let hoogte = startHoogte
  const fns = new Set<() => void>()
  return {
    get innerHeight() {
      return hoogte
    },
    set innerHeight(nieuw: number) {
      hoogte = nieuw
    },
    addEventListener: (_soort, fn) => fns.add(fn),
    removeEventListener: (_soort, fn) => fns.delete(fn),
    vuurResize: () => fns.forEach((fn) => fn()),
    get luisteraars() {
      return fns.size
    },
  }
}

describe('volgVensterHoogte', () => {
  it('zet de hoogte meteen bij het beginnen, in pixels', () => {
    const venster = nepVenster(844)
    const gezet: string[] = []

    volgVensterHoogte(venster, null, (px) => gezet.push(px))

    expect(gezet).toEqual(['844px'])
  })

  it('werkt bij na een resize van het venster', () => {
    const venster = nepVenster(844)
    const gezet: string[] = []
    volgVensterHoogte(venster, null, (px) => gezet.push(px))

    // Een inklappende adresbalk op tablet: het venster wordt plotseling
    // hoger, zonder dat de pagina zelf iets doet.
    venster.innerHeight = 900
    venster.vuurResize()

    expect(gezet).toEqual(['844px', '900px'])
  })

  it('luistert ook naar visualViewport, voor een toetsenbord zonder window-resize', () => {
    const venster = nepVenster(844)
    const visueel = nepVenster(844)
    const gezet: string[] = []
    volgVensterHoogte(venster, visueel, (px) => gezet.push(px))

    // Een toetsenbord verkleint het zichtbare venster, maar `window` krijgt
    // daarbij vaak geen eigen resize-gebeurtenis — alleen `visualViewport`.
    visueel.innerHeight = 500
    visueel.vuurResize()

    expect(gezet).toEqual(['844px', '500px'])
  })

  it('stopt met luisteren na de opruimfunctie', () => {
    const venster = nepVenster(844)
    const gezet: string[] = []
    const stop = volgVensterHoogte(venster, null, (px) => gezet.push(px))

    stop()
    venster.innerHeight = 1000
    venster.vuurResize()

    expect(gezet).toEqual(['844px'])
    expect(venster.luisteraars).toBe(0)
  })
})
