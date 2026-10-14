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
      images: [
        {
          url: '/og?titel=Regels',
          width: 1200,
          height: 630,
          alt: 'Regels',
        },
      ],
    })
  })

  it('zet op de startpagina het eigen adres', () => {
    expect(deelkaart('nl').url).toBe(paginaAdres('nl'))
  })
})
