import { describe, expect, it } from 'vitest'

import robots from '@/app/robots'
import sitemap from '@/app/sitemap'

import {
  EXAMENTRAINING_EXAMENBLAD,
  EXAMENTRAINING_MOMENT,
  EXAMENTRAINING_OMSCHRIJVING,
  EXAMENTRAINING_ONDERDELEN,
  EXAMENTRAINING_PAD,
  EXAMENTRAINING_TITEL,
} from './examentraining'

function geblokkeerd(pad: string): boolean {
  const regels = robots().rules
  const lijst = Array.isArray(regels) ? regels : [regels]
  return lijst.some((regel) => {
    const disallow = regel.disallow ?? []
    const paden = Array.isArray(disallow) ? disallow : [disallow]
    return paden.some((blokkade) => pad === blokkade || pad.startsWith(`${blokkade}`))
  })
}

describe('examentraining-pagina', () => {
  it('staat op een openbaar theorie-adres, niet op het oefenadres', () => {
    expect(EXAMENTRAINING_PAD).toBe('/theorie/examentraining')
    expect(EXAMENTRAINING_PAD).not.toBe('/examentraining')
    expect(EXAMENTRAINING_TITEL).toBe('Examentraining wiskunde B vwo gratis oefenen')
    expect(EXAMENTRAINING_TITEL).toMatch(/wiskunde B vwo/)
    expect(EXAMENTRAINING_OMSCHRIJVING.length).toBeGreaterThan(40)
    expect(EXAMENTRAINING_OMSCHRIJVING).toMatch(/gratis/i)
    expect(EXAMENTRAINING_OMSCHRIJVING).toMatch(/differentiëren/i)
    expect(EXAMENTRAINING_OMSCHRIJVING).toMatch(/centraal examen/i)
    expect(EXAMENTRAINING_OMSCHRIJVING).not.toMatch(/\b(exam training|derivative)\b/i)
  })

  it('noemt het examenmoment en zeven eigen onderdelen, zonder officiële opgaven', () => {
    expect(EXAMENTRAINING_MOMENT).toBe('vrijdag 28 mei 2027, van 13.30 tot 16.30 uur')
    expect(EXAMENTRAINING_EXAMENBLAD).toBe(
      'https://www.examenblad.nl/2027/vwo/vakken/exacte-vakken/wiskunde-b-vwo',
    )
    expect(EXAMENTRAINING_ONDERDELEN).toHaveLength(7)
    expect(EXAMENTRAINING_ONDERDELEN.join(' ')).not.toMatch(/\$[uv]\(/)
  })

  it('staat in de sitemap en robots.txt laat dit adres door', () => {
    const urls = sitemap().map((item) => item.url)
    expect(urls.some((url) => url.endsWith(EXAMENTRAINING_PAD))).toBe(true)
    expect(urls.some((url) => url.endsWith('/examentraining') && !url.endsWith(EXAMENTRAINING_PAD))).toBe(
      false,
    )

    expect(geblokkeerd('/nl/theorie/examentraining')).toBe(false)
    expect(geblokkeerd('/nl/oefenen')).toBe(true)
  })
})
