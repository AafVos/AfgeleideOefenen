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
 */
describe('root-lay-out: geen hoogteverschil tussen html/body en de pagina', () => {
  it('html en body gebruiken h-dvh / min-h-dvh, niet h-full / min-h-full', () => {
    const bron = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8')

    expect(bron).toMatch(/<html[^>]*\bh-dvh\b/)
    expect(bron).not.toMatch(/<html[^>]*\bh-full\b/)

    expect(bron).toMatch(/<body[^>]*\bmin-h-dvh\b/)
    expect(bron).not.toMatch(/<body[^>]*\bmin-h-full\b/)
  })

  it('global-error.tsx gebruikt dezelfde dvh-hoogte op body', () => {
    const bron = readFileSync(join(process.cwd(), 'src/app/global-error.tsx'), 'utf8')

    expect(bron).toMatch(/<body[^>]*\bmin-h-dvh\b/)
    expect(bron).not.toMatch(/<body[^>]*\bmin-h-full\b/)
  })
})
