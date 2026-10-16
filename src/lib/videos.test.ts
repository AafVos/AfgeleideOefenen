import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import {
  getUitlegVideo,
  getUitlegVideos,
  losVideoSlugOp,
  oudVideoAdres,
  uitlegVideoPad,
} from '@/lib/videos'

describe('uitlegvideo-adressen', () => {
  it('geeft elke video een eigen pad', () => {
    const videos = getUitlegVideos()
    expect(videos.length).toBeGreaterThan(0)
    for (const video of videos) {
      expect(uitlegVideoPad(video.slug)).toBe(`/uitleg-videos/${video.slug}`)
      expect(getUitlegVideo(video.slug)?.title).toBe(video.title)
    }
  })

  it('noemt de quotiëntregel bij naam', () => {
    expect(getUitlegVideo('quotientregel')?.title).toBe('De quotiëntregel')
    expect(getUitlegVideo('  quotientregel  ')?.title).toBe('De quotiëntregel')
    expect(getUitlegVideo('quotientregel')?.theoriePad).toBe('/theorie/quotientregel')
    expect(getUitlegVideo('somregel-of-productregel')?.theoriePad).toBe('/theorie/productregel')
    expect(getUitlegVideo('somregel-of-productregel')?.oefenen).toBe(
      '/oefenen?chapter=h2&topic=h2_termsgewijs&cluster=polynoom_differentieren',
    )
  })

  it('zet bij elke video een eigen uitleg', () => {
    for (const video of getUitlegVideos()) {
      expect(video.uitleg.leer.length).toBeGreaterThan(40)
      expect(video.uitleg.regel.length).toBeGreaterThan(0)
      expect(video.uitleg.stappen.length).toBeGreaterThan(0)
      expect(video.uitleg.antwoord).toContain("'")
      expect(video.uitleg.leer).not.toMatch(/\b[uv]\(/)
      expect(video.uitleg.stappen.join(' ')).not.toMatch(/\$[uv]\(/)
    }
  })

  it('kent een onbekende video niet', () => {
    expect(getUitlegVideo('bestaat-niet')).toBeNull()
    expect(getUitlegVideo('  ')).toBeNull()
  })

  it('stuurt de oude somnummers door naar een titel met de regel', () => {
    expect(losVideoSlugOp('som-29')).toBe('productregel-bij-een-kwadraat')
    expect(losVideoSlugOp('som-30')).toBe('productregel-bij-twee-polynomen')
    expect(losVideoSlugOp('som-34')).toBe('quotientregel-bij-een-breuk')
    expect(oudVideoAdres('/nl/uitleg-videos/som-29')).toBe(
      '/nl/uitleg-videos/productregel-bij-een-kwadraat',
    )
    expect(oudVideoAdres('/uitleg-videos/som-30')).toBe(
      '/nl/uitleg-videos/productregel-bij-twee-polynomen',
    )
    expect(oudVideoAdres('/en/uitleg-videos/som-34/')).toBe(
      '/nl/uitleg-videos/quotientregel-bij-een-breuk',
    )
    expect(oudVideoAdres('/nl/uitleg-videos/quotientregel')).toBeNull()

    for (const slug of [
      'productregel-bij-een-kwadraat',
      'productregel-bij-twee-polynomen',
      'quotientregel-bij-een-breuk',
    ]) {
      const video = getUitlegVideo(slug)
      expect(video?.title.toLowerCase()).toMatch(/productregel|quotiëntregel/)
      expect(`${video?.title} ${video?.description} ${video?.slug}`).not.toMatch(
        /som\s*\d|#\d+|H\d|hoofdstuk/i,
      )
    }
  })

  it('zet elke video in de sitemap', () => {
    const urls = sitemap().map((item) => item.url)
    expect(urls.some((url) => url.endsWith('/nl/uitleg-videos'))).toBe(true)
    for (const video of getUitlegVideos()) {
      expect(urls.some((url) => url.endsWith(uitlegVideoPad(video.slug)))).toBe(true)
    }
  })
})
