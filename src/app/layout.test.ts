import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * `html`/`body` met `h-full`/`min-h-full` (= 100% van de statische, grote
 * viewport) kunnen hoger uitvallen dan de `h-dvh`-kolom van
 * `[locale]/layout.tsx` (de echte, actuele viewport). Op een tablet met een
 * adresbalk die in- en uitklapt laat dat een reep kale achtergrond onder de
 * pagina staan: een klik daarop komt op `<body>` of `<html>` terecht en doet
 * niets (AFG-848). Niet op te wekken in jsdom of Playwright zonder een
 * echte, krimpende browserbalk; deze test pint daarom de klassen zelf vast.
 *
 * `dvh` zelf bleek daarna nog niet genoeg (AFG-862): die eenheid werkt in
 * Safari en Chrome pas bij de volgende scroll/resize bij, niet meteen bij
 * zo'n adresbalk of een toetsenbord. Daarom staat er nu overal
 * `var(--app-height,100dvh)`: `100dvh` als meteen beschikbare terugval,
 * `--app-height` als eigenhandige correctie die `ViewportHoogte`
 * (`src/components/viewport-hoogte.tsx`, rekenregels in
 * `src/lib/viewport-hoogte.ts`) bijhoudt. Die rekenregels zijn wél zonder
 * browser te testen — zie `src/lib/viewport-hoogte.test.ts`.
 */
describe('root-lay-out: geen hoogteverschil tussen html/body en de pagina', () => {
  it('html en body gebruiken var(--app-height,100dvh), niet h-full / min-h-full', () => {
    const bron = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8')

    expect(bron).toMatch(/<html[^>]*\bh-\[var\(--app-height,100dvh\)\]/)
    expect(bron).not.toMatch(/<html[^>]*\bh-full\b/)

    expect(bron).toMatch(/<body[^>]*\bmin-h-\[var\(--app-height,100dvh\)\]/)
    expect(bron).not.toMatch(/<body[^>]*\bmin-h-full\b/)
    expect(bron).toMatch(/<ViewportHoogte\s*\/>/)
  })

  it('global-error.tsx gebruikt dezelfde hoogte op body', () => {
    const bron = readFileSync(join(process.cwd(), 'src/app/global-error.tsx'), 'utf8')

    expect(bron).toMatch(/<body[^>]*\bmin-h-\[var\(--app-height,100dvh\)\]/)
    expect(bron).not.toMatch(/<body[^>]*\bmin-h-full\b/)
    expect(bron).toMatch(/<ViewportHoogte\s*\/>/)
  })

  it('[locale]/layout.tsx gebruikt dezelfde hoogte voor zijn kolom', () => {
    const bron = readFileSync(
      join(process.cwd(), 'src/app/[locale]/layout.tsx'),
      'utf8',
    )

    expect(bron).toMatch(/\bh-\[var\(--app-height,100dvh\)\]/)
    expect(bron).not.toMatch(/\bh-dvh\b/)
  })
})
