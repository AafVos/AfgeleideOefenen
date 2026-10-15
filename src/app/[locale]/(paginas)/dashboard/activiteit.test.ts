import { describe, expect, it } from 'vitest'

import {
  beginVanDag,
  berekenReeks,
  dagSleutel,
  laatsteDagen,
  reeksStaatVast,
  telOefendagen,
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

describe('reeksStaatVast', () => {
  it('staat vast als het gat vóór de oudste opgehaalde dag ligt', () => {
    // 28 juni is leeg, en van die dag hebben we de antwoorden al binnen.
    const dagen = new Set(['2026-06-27', '2026-06-29', '2026-06-30'])
    expect(reeksStaatVast(dagen, '2026-07-01', '2026-06-27')).toBe(true)
  })

  it('staat nog niet vast als de reeks doorloopt tot het oudste wat we hebben', () => {
    const dagen = new Set(['2026-06-29', '2026-06-30'])
    expect(reeksStaatVast(dagen, '2026-07-01', '2026-06-29')).toBe(false)
  })

  it('staat vast bij een reeks van 0 zodra we verder terugkeken dan gisteren', () => {
    const dagen = new Set(['2026-06-20'])
    expect(reeksStaatVast(dagen, '2026-07-01', '2026-06-20')).toBe(true)
  })
})

// ---------------------------------------------------------------------
// Antwoorden per dag ophalen. De neppe database hieronder geeft ze terug
// zoals Supabase dat doet: per pagina, nieuwste antwoord eerst.
// ---------------------------------------------------------------------

/** Om 10:00 UTC is het in Nederland diezelfde dag 's ochtends. */
function omTienUur(dag: string): string {
  return `${dag}T10:00:00.000Z`
}

/** De `aantal` dagen tot en met `laatste`, één antwoord per dag. */
function elkeDag(laatste: string, aantal: number): string[] {
  return laatsteDagen(laatste, aantal).map(omTienUur)
}

function nepDatabase(momenten: string[]) {
  const nieuwsteEerst = [...momenten].sort().reverse()
  const opgehaald: number[] = []
  return {
    opgehaald,
    haalPagina: (van: number, tot: number) => {
      opgehaald.push(van)
      return Promise.resolve({
        data: nieuwsteEerst
          .slice(van, tot + 1)
          .map((answered_at) => ({ answered_at })),
      })
    },
  }
}

describe('telOefendagen', () => {
  it('telt hoeveel antwoorden er op elke dag zijn', async () => {
    const db = nepDatabase([
      '2026-07-01T08:00:00.000Z',
      '2026-07-01T09:00:00.000Z',
      '2026-06-30T20:00:00.000Z',
      // 22:30 UTC is in de zomer al 00:30 de volgende dag in Nederland.
      '2026-06-28T22:30:00.000Z',
    ])
    const perDag = await telOefendagen(db.haalPagina, '2026-07-01', '2026-06-18')
    expect(perDag.get('2026-07-01')).toBe(2)
    expect(perDag.get('2026-06-30')).toBe(1)
    expect(perDag.get('2026-06-29')).toBe(1)
    expect(perDag.has('2026-06-28')).toBe(false)
  })

  it('kijkt verder terug dan de 14 balkjes, zodat een reeks van 30 ook 30 is', async () => {
    const db = nepDatabase([...elkeDag('2026-07-01', 30), omTienUur('2026-01-01')])
    const perDag = await telOefendagen(
      db.haalPagina,
      '2026-07-01',
      '2026-06-18',
      20,
    )
    expect(berekenReeks(new Set(perDag.keys()), '2026-07-01')).toBe(30)
  })

  it('stopt met ophalen zodra de reeks vaststaat', async () => {
    const oud = laatsteDagen('2026-01-31', 50).map(omTienUur)
    const db = nepDatabase([...elkeDag('2026-07-01', 20), ...oud])
    const perDag = await telOefendagen(
      db.haalPagina,
      '2026-07-01',
      '2026-06-18',
      20,
    )
    expect(berekenReeks(new Set(perDag.keys()), '2026-07-01')).toBe(20)
    // Twee pagina's: de reeks van 20 dagen, en daarna het gat erachter.
    // De overige 30 oude antwoorden blijven liggen.
    expect(db.opgehaald).toEqual([0, 20])
  })

  it('geeft een lege telling als er nog nooit geoefend is', async () => {
    const perDag = await telOefendagen(
      () => Promise.resolve({ data: [] }),
      '2026-07-01',
      '2026-06-18',
    )
    expect(perDag.size).toBe(0)
  })
})
