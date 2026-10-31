import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('startpagina-knoppen', () => {
  it('heeft maar één hoofdknop, en account aanmaken weegt zwaarder dan inloggen', () => {
    const pagina = readFileSync(
      join(process.cwd(), 'src/app/[locale]/(start)/page.tsx'),
      'utf8',
    )

    const knoppen = pagina.slice(
      pagina.indexOf('mt-6 flex flex-wrap'),
      pagina.indexOf('tagline'),
    )

    expect(knoppen.indexOf("t('ctaRegister')")).toBeLessThan(knoppen.indexOf("t('ctaLogin')"))

    const hoofdknoppen = knoppen.match(/(?<!hover:)bg-accent\b/g) ?? []
    expect(hoofdknoppen).toHaveLength(1)

    const registrerenBlok = knoppen.slice(
      knoppen.indexOf("t('ctaRegister')") - 200,
      knoppen.indexOf("t('ctaRegister')"),
    )
    const inloggenBlok = knoppen.slice(
      knoppen.indexOf("t('ctaLogin')") - 200,
      knoppen.indexOf("t('ctaLogin')"),
    )

    expect(registrerenBlok).toContain('bg-accent')
    expect(inloggenBlok).not.toContain('bg-accent')
  })
})
