import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'

import { getVoorbeeld, getVoorbeelden, voorbeeldPad } from './voorbeelden'

describe('antwoordpagina-s', () => {
  const voorbeelden = getVoorbeelden()

  it('heeft dertig eigen pagina-s met een uniek adres', () => {
    expect(voorbeelden).toHaveLength(30)
    const slugs = voorbeelden.map((voorbeeld) => voorbeeld.slug)
    expect(new Set(slugs).size).toBe(30)
    for (const voorbeeld of voorbeelden) {
      expect(voorbeeld.slug).toMatch(/^[a-z0-9-]+$/)
      expect(voorbeeldPad(voorbeeld.slug)).toBe(`/voorbeeld/${voorbeeld.slug}`)
      expect(getVoorbeeld(voorbeeld.slug)?.kop).toBe(voorbeeld.kop)
      expect(getVoorbeeld(`  ${voorbeeld.slug}  `)?.slug).toBe(voorbeeld.slug)
    }
    expect(getVoorbeeld('bestaat-niet')).toBeNull()
    expect(getVoorbeeld('  ')).toBeNull()
  })

  it('zet de vraag als kop en het antwoord meteen in de tekst', () => {
    for (const voorbeeld of voorbeelden) {
      expect(voorbeeld.kop.startsWith('De afgeleide van ')).toBe(true)
      expect(voorbeeld.omschrijving.length).toBeGreaterThan(40)
      expect(voorbeeld.antwoordTekst.length).toBeGreaterThan(20)
      expect(voorbeeld.antwoordTekst).not.toMatch(/\\/)
      expect(voorbeeld.functie.length).toBeGreaterThan(0)
      expect(voorbeeld.antwoord).not.toContain("f'")
    }
  })

  it('werkt elk voorbeeld uit in stap 0 tot en met 3, met f', () => {
    // Een zuivere macht van x volgt de machtsregel. Geen binnenfunctie die gewoon x is.
    const machtsregelOpX = new Set([
      'wortel-x',
      'x-kwadraat',
      'x-tot-de-derde',
      'een-gedeeld-door-x',
    ])
    // Een standaardafgeleide ken je uit je hoofd. Ook hier geen binnenfunctie die gewoon x is.
    const standaardafgeleide = new Set(['e-tot-de-x', 'ln-x', 'sin-x', 'cos-x', 'tan-x'])
    for (const voorbeeld of voorbeelden) {
      expect(voorbeeld.stappen).toHaveLength(4)
      expect(voorbeeld.stappen[0]).toMatch(/^Stap 0\./)
      expect(voorbeeld.stappen[1]).toMatch(/^Stap 1\./)
      expect(voorbeeld.stappen[2]).toMatch(/^Stap 2\./)
      expect(voorbeeld.stappen[3]).toMatch(/^Stap 3\./)
      const tekst = [...voorbeeld.stappen, voorbeeld.fout].join(' ')
      expect(tekst).toMatch(/\$f/)
      if (machtsregelOpX.has(voorbeeld.slug)) {
        expect(tekst).toMatch(/machtsregel/)
        expect(tekst).toMatch(/\$a =/)
        expect(tekst).toMatch(/\$n =/)
        expect(tekst).not.toMatch(/\$h\(/)
        expect(tekst).not.toMatch(/\$g/)
      } else if (standaardafgeleide.has(voorbeeld.slug)) {
        expect(tekst).toMatch(/standaardafgeleide/)
        expect(tekst).not.toMatch(/\$h\(/)
        expect(tekst).not.toMatch(/\$g/)
      } else {
        expect(tekst).toMatch(/\$g/)
        expect(tekst).toMatch(/\$h/)
      }
      expect(tekst).not.toMatch(/\$[uv]\(/)
      expect(tekst).not.toMatch(/\b[uv]\(/)
      expect(voorbeeld.fout.length).toBeGreaterThan(20)
      expect(`${voorbeeld.kop} ${voorbeeld.omschrijving} ${tekst}`).not.toMatch(
        /som\s*\d|#\d+|hoofdstuk\s+\d/i,
      )
    }
  })

  it('wijst naar de soort som, twee verwante pagina-s en de theorie', () => {
    for (const voorbeeld of voorbeelden) {
      expect(voorbeeld.oefenen).toContain('van=voorbeeld')
      expect(voorbeeld.oefenen).toContain('topic=')
      expect(voorbeeld.oefenen).toContain('cluster=')
      expect(voorbeeld.oefenen.startsWith('/oefenen?')).toBe(true)
      expect(voorbeeld.theoriePad.startsWith('/theorie')).toBe(true)
      expect(voorbeeld.theorieNaam.length).toBeGreaterThan(3)
      expect(voorbeeld.verwant).toHaveLength(2)
      expect(voorbeeld.verwant).not.toContain(voorbeeld.slug)
      for (const slug of voorbeeld.verwant) {
        expect(getVoorbeeld(slug)?.slug).toBe(slug)
      }
    }
  })

  it('rekent elke afgeleide numeriek na', () => {
    const stap = 1e-5
    for (const voorbeeld of voorbeelden) {
      expect(voorbeeld.punten.length).toBeGreaterThan(1)
      for (const x of voorbeeld.punten) {
        const links = voorbeeld.f(x - stap)
        const rechts = voorbeeld.f(x + stap)
        const numeriek = (rechts - links) / (2 * stap)
        const verwacht = voorbeeld.df(x)
        expect(Number.isFinite(links)).toBe(true)
        expect(Number.isFinite(rechts)).toBe(true)
        expect(Number.isFinite(verwacht)).toBe(true)
        const schaal = Math.max(1, Math.abs(verwacht))
        expect(Math.abs(numeriek - verwacht) / schaal).toBeLessThan(1e-4)
      }
    }
  })

  it('zet elke pagina in de sitemap', () => {
    const urls = sitemap().map((item) => item.url)
    for (const voorbeeld of voorbeelden) {
      expect(urls.some((url) => url.endsWith(voorbeeldPad(voorbeeld.slug)))).toBe(true)
    }
  })
})
