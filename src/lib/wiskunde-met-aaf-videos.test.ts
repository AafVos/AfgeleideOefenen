import { describe, expect, it } from 'vitest'

import { getWiskundeMetAafVideos, type VideoPagina } from '@/lib/wiskunde-met-aaf-videos'

const ALLE_PAGINAS: VideoPagina[] = [
  'quotientregel',
  'machtsregel',
  'examentraining',
  'uitleg-videos',
]

describe('wiskunde-met-aaf-videos', () => {
  it('heeft voor elke video een geldig YouTube-id, duur en oefenlink', () => {
    for (const pagina of ALLE_PAGINAS) {
      for (const video of getWiskundeMetAafVideos(pagina)) {
        expect(video.youtubeId).toMatch(/^[\w-]{11}$/)
        expect(video.duration).toMatch(/^\d+:\d{2}$/)
        expect(video.description.length).toBeGreaterThan(20)
        expect(video.oefenen.startsWith('/oefenen')).toBe(true)
      }
    }
  })

  it('zet een Short nooit op de uitleg-videos-overzichtspagina', () => {
    for (const video of getWiskundeMetAafVideos('uitleg-videos')) {
      expect(video.soort).toBe('lang')
    }
  })

  it('geeft alleen video s terug die deze pagina noemen', () => {
    for (const pagina of ALLE_PAGINAS) {
      for (const video of getWiskundeMetAafVideos(pagina)) {
        expect(video.paginas).toContain(pagina)
      }
    }
  })

  it('kent de machtsregelvideo op examentraining en machtsregel', () => {
    const video = getWiskundeMetAafVideos('machtsregel')[0]
    expect(video?.youtubeId).toBe('LOio2lv5V8M')
    expect(video?.soort).toBe('short')
    expect(getWiskundeMetAafVideos('examentraining').map((v) => v.id)).toContain(video?.id)
    expect(video?.bron).toBe('CE vwo wiskunde B 2024 · tijdvak 1 · vraag 1')
  })

  it('geeft niets terug voor een pagina zonder video', () => {
    expect(getWiskundeMetAafVideos('quotientregel')).toEqual([])
    expect(getWiskundeMetAafVideos('uitleg-videos')).toEqual([])
  })
})
