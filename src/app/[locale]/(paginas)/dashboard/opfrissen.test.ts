import { describe, expect, it } from 'vitest'

import { onderdeelVanCluster, opfrisCluster, opfrisGrens } from './opfrissen'
import type { ChapterData } from './topic-block'

// =====================================================================
// De zachte uitnodiging om oude, beheerste stof nog eens te doen
// (AFG-488). Alles hier draait om één vraag: welke soort som stellen we
// voor, en wanneer stellen we niets voor?
// =====================================================================

const NU = new Date('2026-10-19T12:00:00Z')

/** Zoveel dagen geleden, als tijdstip zoals het in de database staat. */
function dagenGeleden(aantal: number): string {
  return new Date(NU.getTime() - aantal * 24 * 60 * 60 * 1000).toISOString()
}

const geenSessies = new Set<string>()

describe('opfrisGrens', () => {
  it('ligt standaard drie weken terug', () => {
    expect(opfrisGrens(NU).toISOString()).toBe('2026-09-28T12:00:00.000Z')
  })
})

describe('opfrisCluster', () => {
  it('stelt een soort som voor die ruim drie weken geleden beheerst is', () => {
    const voortgang = [
      { cluster_id: 'a', status: 'mastered', mastered_at: dagenGeleden(40) },
    ]
    expect(opfrisCluster(voortgang, geenSessies, NU)).toBe('a')
  })

  it('stelt niets voor als het pas beheerst is', () => {
    const voortgang = [
      { cluster_id: 'a', status: 'mastered', mastered_at: dagenGeleden(20) },
    ]
    expect(opfrisCluster(voortgang, geenSessies, NU)).toBeNull()
  })

  it('slaat een soort som over die er pas nog geoefend is', () => {
    const voortgang = [
      { cluster_id: 'a', status: 'mastered', mastered_at: dagenGeleden(40) },
      { cluster_id: 'b', status: 'mastered', mastered_at: dagenGeleden(30) },
    ]
    expect(opfrisCluster(voortgang, new Set(['a']), NU)).toBe('b')
  })

  it('stelt niets voor als alles pas nog geoefend is', () => {
    const voortgang = [
      { cluster_id: 'a', status: 'mastered', mastered_at: dagenGeleden(40) },
    ]
    expect(opfrisCluster(voortgang, new Set(['a']), NU)).toBeNull()
  })

  it('kiest de soort som die het langst geleden beheerst is', () => {
    const voortgang = [
      { cluster_id: 'a', status: 'mastered', mastered_at: dagenGeleden(30) },
      { cluster_id: 'b', status: 'mastered', mastered_at: dagenGeleden(90) },
      { cluster_id: 'c', status: 'mastered', mastered_at: dagenGeleden(60) },
    ]
    expect(opfrisCluster(voortgang, geenSessies, NU)).toBe('b')
  })

  it('kijkt alleen naar wat beheerst is', () => {
    const voortgang = [
      { cluster_id: 'a', status: 'in_progress', mastered_at: dagenGeleden(90) },
      { cluster_id: 'b', status: 'mastered', mastered_at: dagenGeleden(40) },
    ]
    expect(opfrisCluster(voortgang, geenSessies, NU)).toBe('b')
  })

  it('slaat een rij zonder datum over', () => {
    const voortgang = [{ cluster_id: 'a', status: 'mastered', mastered_at: null }]
    expect(opfrisCluster(voortgang, geenSessies, NU)).toBeNull()
  })

  it('slaat een rij met een onleesbare datum over', () => {
    const voortgang = [
      { cluster_id: 'a', status: 'mastered', mastered_at: 'geen datum' },
      { cluster_id: 'b', status: 'mastered', mastered_at: dagenGeleden(40) },
    ]
    expect(opfrisCluster(voortgang, geenSessies, NU)).toBe('b')
  })

  it('stelt niets voor als er nog niets beheerst is', () => {
    expect(opfrisCluster([], geenSessies, NU)).toBeNull()
  })

  it('houdt zich aan een andere drempel', () => {
    const voortgang = [
      { cluster_id: 'a', status: 'mastered', mastered_at: dagenGeleden(10) },
    ]
    expect(opfrisCluster(voortgang, geenSessies, NU, 7)).toBe('a')
    expect(opfrisCluster(voortgang, geenSessies, NU, 14)).toBeNull()
  })
})

const hoofdstukken: ChapterData[] = [
  {
    id: 'h1',
    slug: 'machtsfuncties',
    title: 'Machtsfuncties',
    topics: [
      {
        id: 'o1',
        slug: 'machtsregel',
        title: 'De machtsregel',
        chapterSlug: 'machtsfuncties',
        clusters: [
          {
            id: 'c1',
            slug: 'hele-machten',
            title: 'Hele machten',
            topicId: 'o1',
            isKnown: true,
          },
        ],
      },
    ],
  },
]

describe('onderdeelVanCluster', () => {
  it('geeft hoofdstuk, onderwerp en soort som terug', () => {
    expect(onderdeelVanCluster(hoofdstukken, 'c1')).toEqual({
      chapterId: 'h1',
      chapterSlug: 'machtsfuncties',
      chapterTitle: 'Machtsfuncties',
      topicSlug: 'machtsregel',
      topicTitle: 'De machtsregel',
      clusterId: 'c1',
      clusterSlug: 'hele-machten',
      clusterTitle: 'Hele machten',
    })
  })

  it('geeft niets terug voor een soort som die niet meer in het aanbod staat', () => {
    expect(onderdeelVanCluster(hoofdstukken, 'weg')).toBeNull()
  })
})
