import { describe, expect, it } from 'vitest'

import {
  beginVanDag,
  berekenReeks,
  dagSleutel,
  laatsteDagen,
  vorigeDag,
} from './activiteit'

// =====================================================================
// De reeks ("Dagen op rij") en de dagindeling van het dashboard.
//
// De momenten staan hier als UTC genoteerd, want dat is wat er in de
// database staat. Waar het om gaat is op welke Nederlandse dag ze vallen.
// =====================================================================

describe('dagSleutel', () => {
  it('rekent in Nederlandse tijd, niet in UTC (zomertijd)', () => {
    // 00:30 Nederlandse tijd op 1 juli is 22:30 UTC op 30 juni.
    expect(dagSleutel(new Date('2026-06-30T22:30:00Z'))).toBe('2026-07-01')
  })

  it('rekent ook in de wintertijd in Nederlandse tijd', () => {
    // 00:30 Nederlandse tijd op 1 januari is 23:30 UTC op 31 december.
    expect(dagSleutel(new Date('2025-12-31T23:30:00Z'))).toBe('2026-01-01')
  })

  it('zet de laatste minuut van de dag niet alvast op morgen', () => {
    expect(dagSleutel(new Date('2026-07-01T21:59:59Z'))).toBe('2026-07-01')
  })
})

describe('vorigeDag', () => {
  it('gaat één dag terug', () => {
    expect(vorigeDag('2026-07-01')).toBe('2026-06-30')
  })

  it('gaat over de jaargrens heen', () => {
    expect(vorigeDag('2026-01-01')).toBe('2025-12-31')
  })

  it('kent 29 februari in een schrikkeljaar', () => {
    expect(vorigeDag('2028-03-01')).toBe('2028-02-29')
  })
})

describe('beginVanDag', () => {
  it('begint in de zomer om 22:00 UTC de dag ervoor', () => {
    expect(beginVanDag('2026-07-01').toISOString()).toBe('2026-06-30T22:00:00.000Z')
  })

  it('begint in de winter om 23:00 UTC de dag ervoor', () => {
    expect(beginVanDag('2026-01-01').toISOString()).toBe('2025-12-31T23:00:00.000Z')
  })

  it('klopt ook op de dag dat de klok teruggaat', () => {
    // In de nacht van 24 op 25 oktober 2026 gaat de klok van zomer- naar
    // wintertijd; die dag begint nog in de zomertijd.
    expect(beginVanDag('2026-10-25').toISOString()).toBe('2026-10-24T22:00:00.000Z')
  })

  it('klopt ook op de dag dat de klok vooruitgaat', () => {
    expect(beginVanDag('2026-03-29').toISOString()).toBe('2026-03-28T23:00:00.000Z')
  })
})

describe('laatsteDagen', () => {
  it('geeft veertien dagen, oudste eerst, tot en met vandaag', () => {
    const dagen = laatsteDagen('2026-07-01', 14)
    expect(dagen).toHaveLength(14)
    expect(dagen[0]).toBe('2026-06-18')
    expect(dagen[13]).toBe('2026-07-01')
  })
})

describe('berekenReeks', () => {
  it('telt door als je vandaag nog niet geoefend hebt', () => {
    // Geoefend op dag 1 en dag 2, dashboard geopend op dag 3.
    const dagen = new Set(['2026-06-29', '2026-06-30'])
    expect(berekenReeks(dagen, '2026-07-01')).toBe(2)
  })

  it('telt vandaag mee zodra je vandaag geoefend hebt', () => {
    const dagen = new Set(['2026-06-29', '2026-06-30', '2026-07-01'])
    expect(berekenReeks(dagen, '2026-07-01')).toBe(3)
  })

  it('staat op 0 na twee dagen niets doen', () => {
    const dagen = new Set(['2026-06-28', '2026-06-29'])
    expect(berekenReeks(dagen, '2026-07-01')).toBe(0)
  })

  it('staat op 0 als er nog nooit geoefend is', () => {
    expect(berekenReeks(new Set(), '2026-07-01')).toBe(0)
  })

  it('telt alleen de dagen tot aan het eerste gat', () => {
    const dagen = new Set([
      '2026-06-25',
      '2026-06-26',
      // 27 juni overgeslagen
      '2026-06-29',
      '2026-06-30',
    ])
    expect(berekenReeks(dagen, '2026-07-01')).toBe(2)
  })

  it('telt gewoon door over de maandgrens', () => {
    const dagen = new Set(['2026-06-29', '2026-06-30', '2026-07-01'])
    expect(berekenReeks(dagen, '2026-07-02')).toBe(3)
  })
})
