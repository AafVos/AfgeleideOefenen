import { describe, expect, it } from 'vitest'

import {
  EXAMENJAREN,
  HONEYPOT_VELD,
  isRobot,
  isVol,
  leesAanvraag,
  leesTeller,
  MAX_PER_DAG,
  MAX_PER_DAG_IN_WOORDEN,
  schrijfTeller,
  TELLER_UREN,
  vraagRegel,
} from './video-aanvraag'

/** Een formulier dat klopt; de test past er één ding in aan. */
function formulier(extra: Record<string, string> = {}): FormData {
  const data = new FormData()
  const velden: Record<string, string> = {
    jaar: '2024',
    tijdvak: '1',
    vraagnummer: '6',
    toelichting: 'Ik snap de afgeleide bij b niet.',
    ...extra,
  }
  for (const [naam, waarde] of Object.entries(velden)) {
    if (waarde !== '') data.set(naam, waarde)
  }
  return data
}

describe('leesAanvraag', () => {
  it('leest een kloppend formulier', () => {
    const uitslag = leesAanvraag(formulier())
    expect(uitslag).toEqual({
      ok: true,
      aanvraag: {
        jaar: 2024,
        tijdvak: 1,
        vraagnummer: '6',
        toelichting: 'Ik snap de afgeleide bij b niet.',
        email: null,
        magMailen: false,
      },
    })
  })

  it('laat een vraagnummer met een letter toe en maakt die klein', () => {
    const uitslag = leesAanvraag(formulier({ vraagnummer: '12A' }))
    expect(uitslag.ok && uitslag.aanvraag.vraagnummer).toBe('12a')
  })

  it('weigert een jaar dat niet in de lijst staat', () => {
    const uitslag = leesAanvraag(formulier({ jaar: '1999' }))
    expect(uitslag.ok).toBe(false)
  })

  it('kent elk jaar uit de keuzelijst', () => {
    for (const jaar of EXAMENJAREN) {
      expect(leesAanvraag(formulier({ jaar: String(jaar) })).ok).toBe(true)
    }
  })

  it('weigert een tijdvak dat niet bestaat', () => {
    expect(leesAanvraag(formulier({ tijdvak: '4' })).ok).toBe(false)
  })

  it('weigert een leeg vraagnummer', () => {
    expect(leesAanvraag(formulier({ vraagnummer: '' })).ok).toBe(false)
  })

  it('weigert tekst in plaats van een vraagnummer', () => {
    expect(leesAanvraag(formulier({ vraagnummer: 'de hele opgave' })).ok).toBe(false)
  })

  it('weigert een toelichting die te lang is', () => {
    expect(leesAanvraag(formulier({ toelichting: 'a'.repeat(1001) })).ok).toBe(false)
  })

  it('mag zonder toelichting', () => {
    const uitslag = leesAanvraag(formulier({ toelichting: '' }))
    expect(uitslag.ok && uitslag.aanvraag.toelichting).toBe(null)
  })

  it('bewaart het adres als de leerling bericht wil', () => {
    const uitslag = leesAanvraag(
      formulier({ magMailen: 'ja', email: 'leerling@voorbeeld.nl' }),
    )
    expect(uitslag.ok && uitslag.aanvraag).toMatchObject({
      email: 'leerling@voorbeeld.nl',
      magMailen: true,
    })
  })

  it('weigert een adres zonder vinkje', () => {
    expect(leesAanvraag(formulier({ email: 'leerling@voorbeeld.nl' })).ok).toBe(false)
  })

  it('weigert een vinkje zonder adres', () => {
    expect(leesAanvraag(formulier({ magMailen: 'ja' })).ok).toBe(false)
  })

  it('weigert een adres dat geen adres is', () => {
    expect(leesAanvraag(formulier({ magMailen: 'ja', email: 'leerling' })).ok).toBe(false)
  })
})

describe('isRobot', () => {
  it('ziet een ingevuld verborgen veld', () => {
    expect(isRobot(formulier({ [HONEYPOT_VELD]: 'http://spam' }))).toBe(true)
  })

  it('laat een leeg verborgen veld door', () => {
    expect(isRobot(formulier())).toBe(false)
  })
})

describe('vraagRegel', () => {
  it('schrijft de vraag in één regel', () => {
    expect(vraagRegel({ jaar: 2024, tijdvak: 1, vraagnummer: '6' })).toBe(
      '2024 · tijdvak 1 · vraag 6',
    )
  })
})

describe('teller', () => {
  const nu = 1_760_000_000_000

  it('begint bij nul zonder koekje', () => {
    expect(leesTeller(undefined, nu)).toEqual({ aantal: 0, begonnenOp: nu })
  })

  it('leest terug wat hij schreef', () => {
    const teller = { aantal: 2, begonnenOp: nu - 1000 }
    expect(leesTeller(schrijfTeller(teller), nu)).toEqual(teller)
  })

  it('begint opnieuw bij onzin', () => {
    expect(leesTeller('kapot', nu)).toEqual({ aantal: 0, begonnenOp: nu })
  })

  it('begint opnieuw als de dag om is', () => {
    const oud = schrijfTeller({
      aantal: 3,
      begonnenOp: nu - (TELLER_UREN + 1) * 60 * 60 * 1000,
    })
    expect(leesTeller(oud, nu)).toEqual({ aantal: 0, begonnenOp: nu })
  })

  it('is vol na het maximum', () => {
    expect(isVol({ aantal: MAX_PER_DAG - 1, begonnenOp: nu })).toBe(false)
    expect(isVol({ aantal: MAX_PER_DAG, begonnenOp: nu })).toBe(true)
  })

  it('noemt MAX_PER_DAG voluit in woorden, zodat de foutmelding meeverandert', () => {
    expect(MAX_PER_DAG_IN_WOORDEN).toBe('drie')
    expect(MAX_PER_DAG).toBe(3)
  })
})
