import { describe, expect, it } from 'vitest'

import { instellingenVan, isSiteVariant, SITE_CONFIG, SITE_VARIANTEN } from './site'

describe('site-versies', () => {
  it('is zonder omgevingsvariabele afgeleideoefenen.nl', () => {
    // De tests draaien zonder NEXT_PUBLIC_SITE_VARIANT, net als een bouw
    // waar die variabele niet gezet is.
    expect(SITE_CONFIG.variant).toBe('afgeleide')
    expect(SITE_CONFIG.domain).toBe('afgeleideoefenen.nl')
    expect(SITE_CONFIG.brandNaam).toBe('AfgeleideOefenen')
  })

  it('zet de naam van wiskundemetaaf in twee stukken', () => {
    const site = instellingenVan('wiskundemetaaf')
    // Met de harde spatie ertussen; brandNaam heeft de gewone spatie.
    expect(site.brandVoor + site.brandAccent).toBe('Wiskunde met\u00A0Aaf')
    expect(site.brandNaam).toBe('Wiskunde met Aaf')
    expect(site.brandAccent).toBe('Aaf')
    expect(site.domain).toBe('wiskundemetaaf.nl')
  })

  it('kent alleen de twee sites die er zijn', () => {
    expect(isSiteVariant('afgeleide')).toBe(true)
    expect(isSiteVariant('wiskundemetaaf')).toBe(true)
    expect(isSiteVariant('integraal')).toBe(false)
    expect(isSiteVariant(undefined)).toBe(false)
  })

  it('heeft voor elke site een eigen domein', () => {
    const domeinen = SITE_VARIANTEN.map((v) => instellingenVan(v).domain)
    expect(new Set(domeinen).size).toBe(SITE_VARIANTEN.length)
  })
})
