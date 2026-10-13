import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import { getUitlegVideo, getUitlegVideos, uitlegVideoPad } from '@/lib/videos'

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

  it('zet elke video in de sitemap', () => {
    const urls = sitemap().map((item) => item.url)
    expect(urls.some((url) => url.endsWith('/nl/uitleg-videos'))).toBe(true)
    for (const video of getUitlegVideos()) {
      expect(urls.some((url) => url.endsWith(uitlegVideoPad(video.slug)))).toBe(true)
    }
  })
})
