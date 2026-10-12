import { describe, expect, it } from 'vitest'

import { canoniek, deelkaart, paginaAdres } from './seo'

describe('deelkaart', () => {
  it('gebruikt hetzelfde adres als de canonieke link', () => {
    const adres = paginaAdres('nl', '/theorie')
    expect(adres.endsWith('/nl/theorie')).toBe(true)
    expect(canoniek('nl', '/theorie')).toEqual({ canonical: adres })
    expect(deelkaart('nl', '/theorie', { title: 'Regels', description: 'Kort' })).toEqual({
      url: adres,
      title: 'Regels',
      description: 'Kort',
    })
  })

  it('zet op de startpagina alleen het eigen adres', () => {
    expect(deelkaart('nl')).toEqual({ url: paginaAdres('nl') })
  })
})
