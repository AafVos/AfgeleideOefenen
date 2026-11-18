import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'

import {
  getVoorbeeld,
  getVoorbeelden,
  voorbeeldOefenVraag,
  voorbeeldPad,
  voorbeeldTitel,
} from './voorbeelden'

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

  it('wijst naar de soort som, drie tot vijf verwante pagina-s en de theorie', () => {
    for (const voorbeeld of voorbeelden) {
      expect(voorbeeld.oefenen).toContain('van=voorbeeld')
      expect(voorbeeld.oefenen).toContain('topic=')
      expect(voorbeeld.oefenen).toContain('cluster=')
      expect(voorbeeld.oefenen.startsWith('/oefenen?')).toBe(true)
      expect(voorbeeld.theoriePad.startsWith('/theorie')).toBe(true)
      expect(voorbeeld.theorieNaam.length).toBeGreaterThan(3)
      expect(voorbeeld.verwant.length).toBeGreaterThanOrEqual(3)
      expect(voorbeeld.verwant.length).toBeLessThanOrEqual(5)
      expect(new Set(voorbeeld.verwant).size).toBe(voorbeeld.verwant.length)
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

  it('zet "oefenen" in de titel voor de zoekmachine, los van de kop op de pagina', () => {
    for (const voorbeeld of voorbeelden) {
      const titel = voorbeeldTitel(voorbeeld)
      expect(titel).not.toMatch(/^De /)
      expect(titel.endsWith(' oefenen')).toBe(true)
      expect(titel.length).toBeLessThanOrEqual(60)
    }
    expect(voorbeeldTitel(getVoorbeeld('ln-x')!)).toBe('Afgeleide van ln x (lnx) oefenen')
    expect(voorbeeldTitel(getVoorbeeld('sin-x')!)).toBe('Afgeleide van sin x (sinx) oefenen')
    expect(voorbeeldTitel(getVoorbeeld('cos-x')!)).toBe('Afgeleide van cos x (cosx) oefenen')
    expect(voorbeeldTitel(getVoorbeeld('e-tot-de-2x')!)).toBe(
      'Afgeleide van e tot de macht 2x oefenen',
    )
  })

  it('zet de typvorm zonder spatie naast de leesbare vorm in de titel (AFG-704)', () => {
    const metTypVorm = ['ln-x', 'sin-x', 'cos-x']
    for (const slug of metTypVorm) {
      const voorbeeld = getVoorbeeld(slug)!
      expect(voorbeeld.typVorm).toBeTruthy()
      expect(voorbeeldTitel(voorbeeld)).toContain(`(${voorbeeld.typVorm})`)
      expect(voorbeeld.omschrijving).not.toContain(voorbeeld.typVorm)
    }
  })

  it('toont "Ook gezocht als" met typvormen op de drukste pagina-s (AFG-766)', () => {
    const metOokGezochtAls = ['een-gedeeld-door-x', 'e-tot-de-x', 'ln-x', 'sin-x', 'cos-x']
    for (const slug of metOokGezochtAls) {
      const voorbeeld = getVoorbeeld(slug)!
      expect(voorbeeld.ookGezochtAls).toBeDefined()
      expect(voorbeeld.ookGezochtAls!.length).toBeGreaterThan(0)
      for (const vorm of voorbeeld.ookGezochtAls!) {
        // Geen spoiler: het antwoord (bijvoorbeeld "cos(x)" op de sin-x-pagina) hoort hier niet in.
        expect(vorm).not.toContain(voorbeeld.antwoordTekst)
        expect(vorm.length).toBeGreaterThan(0)
      }
    }
  })

  it('toont de brug naar de examentraining op de drukste pagina-s (AFG-623)', () => {
    const metBrug = [
      'wortel-x',
      'een-gedeeld-door-x',
      'e-tot-de-x',
      'ln-x',
      'sin-x',
      'cos-x',
    ]
    for (const slug of metBrug) {
      expect(getVoorbeeld(slug)?.examenbrug).toBe(true)
    }
    const zonderBrug = voorbeelden.filter((v) => !metBrug.includes(v.slug))
    for (const voorbeeld of zonderBrug) {
      expect(voorbeeld.examenbrug).toBeFalsy()
    }
  })

  it('heeft een extra FAQ-vraag op de drukste pagina-s zonder klikken (AFG-658)', () => {
    const metUitgebreideFaq = ['een-gedeeld-door-x', 'e-tot-de-x', 'ln-x', 'sin-x', 'cos-x']
    // AFG-781: op deze drie mag de meta de standaardregel tonen (0% CTR
    // bleef aanhouden); de rest blijft voorlopig belofte-eerst (AFG-586).
    const metStandaardregelInMeta = ['een-gedeeld-door-x', 'ln-x', 'sin-x']
    for (const slug of metUitgebreideFaq) {
      const voorbeeld = getVoorbeeld(slug)!
      expect(voorbeeld.faqUitgebreid).toBe(true)
      const vraag = voorbeeldOefenVraag(voorbeeld)
      expect(vraag.startsWith('Hoe oefen je de afgeleide van ')).toBe(true)
      expect(vraag.endsWith('?')).toBe(true)
      expect(voorbeeld.omschrijving).not.toBe(voorbeeld.antwoordTekst)
      if (metStandaardregelInMeta.includes(slug)) {
        expect(voorbeeld.omschrijving).toMatch(/^De afgeleide van .+ is /)
      } else {
        // Het antwoord op de extra vraag blijft belofte-eerst: geen kant-en-klaar antwoord.
        expect(voorbeeld.omschrijving).not.toMatch(/^De afgeleide van .+ is /)
      }
    }
    const zonderUitgebreideFaq = voorbeelden.filter((v) => !metUitgebreideFaq.includes(v.slug))
    for (const voorbeeld of zonderUitgebreideFaq) {
      expect(voorbeeld.faqUitgebreid).toBeFalsy()
      // De standaardregel staat alleen op pagina's met de extra FAQ-vraag hierboven.
      expect(voorbeeld.omschrijving).not.toMatch(/^De afgeleide van .+ is /)
    }
    expect(voorbeeldOefenVraag(getVoorbeeld('ln-x')!)).toBe('Hoe oefen je de afgeleide van ln x?')
  })

  it('toont de standaardregel in de meta, nooit het antwoord van de oefensommen (AFG-781)', () => {
    const metStandaardregelInMeta = {
      'een-gedeeld-door-x': 'De afgeleide van 1/x is -1/x². Daarna drie sommen om te oefenen.',
      'ln-x': 'De afgeleide van ln x is 1/x. Daarna drie sommen om te oefenen.',
      'sin-x': 'De afgeleide van sin x is cos x. Daarna drie sommen om te oefenen.',
    }
    for (const [slug, omschrijving] of Object.entries(metStandaardregelInMeta)) {
      expect(getVoorbeeld(slug)!.omschrijving).toBe(omschrijving)
    }
  })

  it('zet elke pagina in de sitemap', () => {
    const urls = sitemap().map((item) => item.url)
    for (const voorbeeld of voorbeelden) {
      expect(urls.some((url) => url.endsWith(voorbeeldPad(voorbeeld.slug)))).toBe(true)
    }
  })
})
