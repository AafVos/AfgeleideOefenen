import { describe, expect, it } from 'vitest'

import { createStopwatch } from './stopwatch'

// =====================================================================
// De klok onder "tijd per opgave". Geen browser: de tijd komt hier uit een
// nepklok die we zelf vooruitzetten.
// =====================================================================

function fakeClock(start = 1_000_000) {
  let nu = start
  return {
    now: () => nu,
    verder: (seconden: number) => {
      nu += seconden * 1000
    },
  }
}

describe('createStopwatch', () => {
  it('telt niets zolang hij niet gestart is', () => {
    const klok = fakeClock()
    const sw = createStopwatch(klok.now)

    klok.verder(30)

    expect(sw.elapsedSec()).toBe(0)
  })

  it('telt de tijd die verstrijkt nadat hij gestart is', () => {
    const klok = fakeClock()
    const sw = createStopwatch(klok.now)

    sw.resume()
    klok.verder(42)

    expect(sw.elapsedSec()).toBe(42)
  })

  it('telt de tijd met het tabblad weg niet mee', () => {
    const klok = fakeClock()
    const sw = createStopwatch(klok.now)

    sw.resume()
    klok.verder(10) // nadenken
    sw.pause()
    klok.verder(600) // tien minuten in een andere app
    sw.resume()
    klok.verder(5) // weer nadenken

    expect(sw.elapsedSec()).toBe(15)
  })

  it('gaat niet dubbel lopen als het tabblad al in beeld was', () => {
    const klok = fakeClock()
    const sw = createStopwatch(klok.now)

    sw.resume()
    klok.verder(8)
    sw.resume()
    klok.verder(2)

    expect(sw.elapsedSec()).toBe(10)
  })

  it('begint bij "nog een keer proberen" weer bij nul en loopt door', () => {
    const klok = fakeClock()
    const sw = createStopwatch(klok.now)

    sw.resume()
    klok.verder(50)
    sw.reset()
    klok.verder(7)

    expect(sw.elapsedSec()).toBe(7)
  })

  it('blijft na "nog een keer proberen" stilstaan als het tabblad weg is', () => {
    const klok = fakeClock()
    const sw = createStopwatch(klok.now)

    sw.resume()
    klok.verder(50)
    sw.pause()
    sw.reset()
    klok.verder(300)

    expect(sw.elapsedSec()).toBe(0)
  })

  it('maakt van een klok die achteruit gezet wordt geen negatieve tijd', () => {
    const klok = fakeClock()
    const sw = createStopwatch(klok.now)

    sw.resume()
    klok.verder(-60)

    expect(sw.elapsedSec()).toBe(0)
  })
})
