import { describe, expect, it } from 'vitest'

import {
  getWiskundeMetAafVideos,
  oefenlinkMetYoutubeHerkomst,
  type VideoPagina,
} from '@/lib/wiskunde-met-aaf-videos'

const ALLE_PAGINAS: VideoPagina[] = [
  'quotientregel',
  'machtsregel',
  'raaklijn',
  'ln-x',
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

  it('kent de quotiëntregelvideo op quotientregel, examentraining en uitleg-videos', () => {
    const video = getWiskundeMetAafVideos('quotientregel')[0]
    expect(video?.youtubeId).toBe('dE6p5y89aFQ')
    expect(video?.soort).toBe('lang')
    expect(getWiskundeMetAafVideos('examentraining').map((v) => v.id)).toContain(video?.id)
    expect(getWiskundeMetAafVideos('uitleg-videos').map((v) => v.id)).toContain(video?.id)
    expect(video?.bron).toBe('CE vwo wiskunde B 2023 · tijdvak 2 · vraag 1')
  })

  it('kent de ln(x)-video op ln-x en uitleg-videos, zonder examenbron', () => {
    const video = getWiskundeMetAafVideos('ln-x')[0]
    expect(video?.youtubeId).toBe('q53YUlb5QzQ')
    expect(video?.soort).toBe('lang')
    expect(getWiskundeMetAafVideos('uitleg-videos').map((v) => v.id)).toContain(video?.id)
    expect(video?.bron).toBeNull()
  })

  it('zet de herkomstcode youtube op de oefenlink, nooit youtube-video (AFG-868)', () => {
    expect(oefenlinkMetYoutubeHerkomst('/oefenen?onderwerp=machtsregel')).toBe(
      '/oefenen?onderwerp=machtsregel&van=youtube',
    )
  })

  it('kent de raaklijnvideo op raaklijn, examentraining en uitleg-videos', () => {
    const video = getWiskundeMetAafVideos('raaklijn')[0]
    expect(video?.youtubeId).toBe('sc3bY-eQKw8')
    expect(video?.soort).toBe('lang')
    expect(getWiskundeMetAafVideos('examentraining').map((v) => v.id)).toContain(video?.id)
    expect(getWiskundeMetAafVideos('uitleg-videos').map((v) => v.id)).toContain(video?.id)
    expect(video?.bron).toBe('CE vwo wiskunde B 2024 · tijdvak 1 · vraag 6')
  })
})
