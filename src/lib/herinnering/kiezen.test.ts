import { describe, expect, it } from 'vitest'

import {
  AFKOEL_DAGEN,
  MAX_HERINNERINGEN,
  MAX_PER_RONDE,
  STIL_DAGEN,
  kiesOntvangers,
  magHerinnering,
  type HerinneringKandidaat,
} from './kiezen'

const NU = new Date('2026-10-19T04:00:00.000Z')
const DAG_MS = 24 * 60 * 60 * 1000

/** Een tijdstip zoveel dagen vóór `NU`. */
function dagenGeleden(dagen: number): string {
  return new Date(NU.getTime() - dagen * DAG_MS).toISOString()
}

function kandidaat(extra: Partial<HerinneringKandidaat> = {}): HerinneringKandidaat {
  return {
    userId: 'leerling-1',
    aan: true,
    aanSinds: dagenGeleden(30),
    laatsteActiviteit: dagenGeleden(STIL_DAGEN),
    laatsteHerinnering: null,
    aantal: 0,
    ...extra,
  }
}

describe('magHerinnering', () => {
  it('stuurt niets als de schakelaar uit staat', () => {
    expect(magHerinnering(kandidaat({ aan: false }), NU)).toBe(false)
  })

  it('stuurt pas na zeven dagen stilte', () => {
    expect(
      magHerinnering(kandidaat({ laatsteActiviteit: dagenGeleden(STIL_DAGEN - 1) }), NU),
    ).toBe(false)
    expect(
      magHerinnering(kandidaat({ laatsteActiviteit: dagenGeleden(STIL_DAGEN) }), NU),
    ).toBe(true)
  })

  it('telt de stilte vanaf het aanzetten als er nog nooit geoefend is', () => {
    const nooitGeoefend = { laatsteActiviteit: null }
    expect(
      magHerinnering(kandidaat({ ...nooitGeoefend, aanSinds: dagenGeleden(2) }), NU),
    ).toBe(false)
    expect(
      magHerinnering(kandidaat({ ...nooitGeoefend, aanSinds: dagenGeleden(9) }), NU),
    ).toBe(true)
  })

  it('wacht de afkoelperiode af na een vorige herinnering', () => {
    const langStil = { laatsteActiviteit: dagenGeleden(60) }
    expect(
      magHerinnering(
        kandidaat({ ...langStil, laatsteHerinnering: dagenGeleden(AFKOEL_DAGEN - 1) }),
        NU,
      ),
    ).toBe(false)
    expect(
      magHerinnering(
        kandidaat({ ...langStil, laatsteHerinnering: dagenGeleden(AFKOEL_DAGEN) }),
        NU,
      ),
    ).toBe(true)
  })

  it('houdt na drie herinneringen op', () => {
    const stilEnAfgekoeld = {
      laatsteActiviteit: dagenGeleden(90),
      laatsteHerinnering: dagenGeleden(30),
    }
    expect(
      magHerinnering(
        kandidaat({ ...stilEnAfgekoeld, aantal: MAX_HERINNERINGEN - 1 }),
        NU,
      ),
    ).toBe(true)
    expect(
      magHerinnering(kandidaat({ ...stilEnAfgekoeld, aantal: MAX_HERINNERINGEN }), NU),
    ).toBe(false)
  })

  it('stuurt niets als er geen enkel tijdstip bekend is', () => {
    expect(
      magHerinnering(kandidaat({ laatsteActiviteit: null, aanSinds: null }), NU),
    ).toBe(false)
  })

  it('trekt zich niets aan van een onleesbaar tijdstip', () => {
    expect(
      magHerinnering(kandidaat({ laatsteActiviteit: 'geen datum', aanSinds: null }), NU),
    ).toBe(false)
  })
})

describe('kiesOntvangers', () => {
  it('neemt alleen wie mag, de langst stille eerst', () => {
    const gekozen = kiesOntvangers(
      [
        kandidaat({ userId: 'kort-stil', laatsteActiviteit: dagenGeleden(8) }),
        kandidaat({ userId: 'uit', aan: false, laatsteActiviteit: dagenGeleden(40) }),
        kandidaat({ userId: 'lang-stil', laatsteActiviteit: dagenGeleden(25) }),
      ],
      NU,
    )
    expect(gekozen.map((k) => k.userId)).toEqual(['lang-stil', 'kort-stil'])
  })

  it('stuurt er nooit meer dan het maximum per ronde', () => {
    const veel = Array.from({ length: MAX_PER_RONDE + 10 }, (_, i) =>
      kandidaat({ userId: `leerling-${i}`, laatsteActiviteit: dagenGeleden(10 + i) }),
    )
    expect(kiesOntvangers(veel, NU)).toHaveLength(MAX_PER_RONDE)
  })

  it('kiest niemand als niemand hem aan heeft staan', () => {
    expect(kiesOntvangers([kandidaat({ aan: false })], NU)).toEqual([])
  })
})
