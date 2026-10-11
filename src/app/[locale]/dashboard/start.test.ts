import { describe, expect, it } from 'vitest'

import { eersteOnderdeel, opgaveLink } from './start'
import type { ChapterData, ClusterData } from './topic-block'

// =====================================================================
// Waar een kersverse leerling begint (zie AFG-114).
// =====================================================================

function cluster(slug: string): ClusterData {
  return {
    id: `id-${slug}`,
    slug,
    title: slug,
    topicId: 'topic',
    totalAnswered: 0,
    totalCorrect: 0,
    isKnown: false,
    isSkipped: false,
  }
}

function hoofdstuk(
  slug: string,
  onderwerpen: Array<{ slug: string; clusters: ClusterData[] }>,
): ChapterData {
  return {
    id: `id-${slug}`,
    slug,
    title: slug,
    topics: onderwerpen.map((o) => ({
      id: `id-${o.slug}`,
      slug: o.slug,
      title: o.slug,
      chapterSlug: slug,
      clusters: o.clusters,
    })),
  }
}

describe('eersteOnderdeel', () => {
  it('pakt het eerste hoofdstuk, onderwerp en soort som', () => {
    const chapters = [
      hoofdstuk('h1', [
        { slug: 'machten', clusters: [cluster('a'), cluster('b')] },
        { slug: 'quotient', clusters: [cluster('c')] },
      ]),
      hoofdstuk('h2', [{ slug: 'ketting', clusters: [cluster('d')] }]),
    ]

    expect(eersteOnderdeel(chapters)).toMatchObject({
      chapterSlug: 'h1',
      topicSlug: 'machten',
      clusterSlug: 'a',
    })
  })

  it('slaat onderwerpen zonder soorten sommen over', () => {
    const chapters = [
      hoofdstuk('h1', [
        { slug: 'leeg', clusters: [] },
        { slug: 'machten', clusters: [cluster('a')] },
      ]),
    ]

    expect(eersteOnderdeel(chapters)?.topicSlug).toBe('machten')
  })

  it('slaat hoofdstukken over waar helemaal niets in staat', () => {
    const chapters = [
      hoofdstuk('h1', [{ slug: 'leeg', clusters: [] }]),
      hoofdstuk('h2', [{ slug: 'ketting', clusters: [cluster('d')] }]),
    ]

    expect(eersteOnderdeel(chapters)?.chapterSlug).toBe('h2')
  })

  it('geeft niets terug als er nergens een opgave te vinden is', () => {
    expect(eersteOnderdeel([])).toBeNull()
    expect(eersteOnderdeel([hoofdstuk('h1', [])])).toBeNull()
  })
})

describe('opgaveLink', () => {
  it('zet hoofdstuk, onderwerp, soort som en opgave in de link', () => {
    const onderdeel = eersteOnderdeel([
      hoofdstuk('h1', [{ slug: 'machten', clusters: [cluster('a')] }]),
    ])!

    expect(opgaveLink(onderdeel, 'vraag-1')).toBe(
      '/oefenen?chapter=h1&topic=machten&cluster=a&q=vraag-1',
    )
  })

  it('maakt tekens die niet in een URL mogen onschadelijk', () => {
    const onderdeel = eersteOnderdeel([
      hoofdstuk('h&1', [{ slug: 'a b', clusters: [cluster('c?d')] }]),
    ])!

    expect(opgaveLink(onderdeel, 'vraag 1')).toBe(
      '/oefenen?chapter=h%261&topic=a%20b&cluster=c%3Fd&q=vraag%201',
    )
  })
})
