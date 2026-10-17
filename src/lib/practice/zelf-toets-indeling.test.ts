import { describe, expect, it } from 'vitest'

import { losSelectieOp } from '@/lib/practice/oefenen-indeling'
import {
  bouwZelfToetsBoom,
  linkNaToets,
  type ZelfToetsIndelingInvoer,
} from '@/lib/practice/zelf-toets-indeling'

const h2 = {
  id: 'c2',
  slug: 'h2',
  title: 'De afgeleide functie',
  book_part: 1,
  order_index: 2,
}
const beweging = {
  id: 'cb',
  slug: 'beweging',
  title: 'Beweging',
  book_part: 2,
  order_index: 20,
}

const p24 = {
  id: 'p24',
  chapter_id: 'c2',
  slug: 'h2-4',
  label: '2.4',
  title: 'Toepassingen van de afgeleide',
  order_index: 4,
}

const blokA = {
  id: 'ba',
  paragraph_id: 'p24',
  slug: 'h2-4a',
  letter: 'A',
  title: 'Raaklijn',
  order_index: 1,
}
const blokLeeg = {
  id: 'bleeg',
  paragraph_id: 'p24',
  slug: 'h2-4z',
  letter: 'Z',
  title: 'Nog leeg',
  order_index: 9,
}

function topic(
  slug: string,
  title: string,
  chapterId: string,
  blockId: string | null,
  order: number,
) {
  return {
    id: `t-${slug}`,
    slug,
    title,
    chapter_id: chapterId,
    order_index: order,
    theory_block_id: blockId,
  }
}

const raaklijn = topic('raaklijn', 'Raaklijn', 'c2', 'ba', 1)
const helling = topic('helling', 'Helling', 'c2', 'ba', 2)
const snelheid = topic('snelheid', 'Snelheid', 'cb', null, 1)

function cluster(
  slug: string,
  title: string,
  topicId: string,
  order: number,
  blockId: string | null = null,
) {
  return {
    id: `c-${slug}`,
    slug,
    title,
    topic_id: topicId,
    order_index: order,
    theory_block_id: blockId,
  }
}

const clusters = [
  cluster('richting', 'Richtingscoëfficiënt', raaklijn.id, 1),
  cluster('vergelijking', 'Vergelijking van de raaklijn', raaklijn.id, 2),
  cluster('helling', 'Helling', helling.id, 1),
  cluster('snelheid', 'Snelheid', snelheid.id, 1),
]

function metTellers(lijst: typeof clusters): ZelfToetsIndelingInvoer['clusters'] {
  return lijst.map((item) => ({
    ...item,
    questionCount: 2,
    newCount: 2,
    wrongCount: 0,
  }))
}

const data: ZelfToetsIndelingInvoer = {
  chapters: [beweging, h2],
  paragraphs: [p24],
  blocks: [blokLeeg, blokA],
  topics: [snelheid, helling, raaklijn],
  clusters: metTellers(clusters),
}

const oefenData = {
  chapters: [h2, beweging],
  paragraphs: [p24],
  blocks: [blokA, blokLeeg],
  topics: [raaklijn, helling, snelheid],
  clusters,
  tiles: clusters.map((item) => ({ clusterId: item.id })),
}

describe('zelf-toets per theorieblok', () => {
  it('trekt voor een blok dezelfde soorten sommen als de onderwerpen samen', () => {
    const boom = bouwZelfToetsBoom(data)
    const blok = boom
      .find((h) => h.slug === 'h2')!
      .paragrafen.find((p) => p.label === '2.4')!
      .blokken.find((b) => b.slug === 'h2-4a')!

    expect(blok.clusters.map((item) => item.id)).toEqual([
      'c-richting',
      'c-vergelijking',
      'c-helling',
    ])
    expect(blok.clusters.find((item) => item.slug === 'vergelijking')?.id).toBe(
      'c-vergelijking',
    )
  })

  it('zet een soort som met een eigen blok bij dat blok', () => {
    const snelheidBlok = {
      id: 'be',
      paragraph_id: 'p24',
      slug: 'h2-4e',
      letter: 'E',
      title: 'Snelheid en afgeleide',
      order_index: 5,
    }
    const soorten = metTellers([
      ...clusters,
      cluster('snelheid-som', 'Snelheid', raaklijn.id, 3, 'be'),
    ])
    const boom = bouwZelfToetsBoom({
      ...data,
      blocks: [...data.blocks, snelheidBlok],
      clusters: soorten,
    })
    const blokken = boom
      .find((h) => h.slug === 'h2')!
      .paragrafen.find((p) => p.label === '2.4')!.blokken

    expect(blokken.find((b) => b.slug === 'h2-4a')!.clusters.map((item) => item.slug)).toEqual([
      'richting',
      'vergelijking',
      'helling',
    ])
    expect(blokken.find((b) => b.slug === 'h2-4e')!.clusters.map((item) => item.slug)).toEqual([
      'snelheid-som',
    ])
    expect(blokken.find((b) => b.slug === 'h2-4e')!.heeftOpgaven).toBe(true)
  })

  it('houdt Beweging als onderwerpen en laat een leeg blok staan', () => {
    const boom = bouwZelfToetsBoom(data)
    expect(boom.map((h) => h.slug)).toEqual(['h2', 'beweging'])

    const boek = boom.find((h) => h.slug === 'h2')!
    const letters = boek.paragrafen.flatMap((p) => p.blokken.map((b) => b.letter))
    expect(letters).toEqual(['A', 'Z'])
    expect(boek.paragrafen[0]!.blokken.find((b) => b.letter === 'Z')!.heeftOpgaven).toBe(
      false,
    )

    const zonderBoek = boom.find((h) => h.slug === 'beweging')!
    expect(zonderBoek.paragrafen).toEqual([])
    expect(zonderBoek.losseOnderwerpen.map((o) => o.title)).toEqual(['Snelheid'])
  })

  it('stuurt de resultaatlink naar het blok en de soort som', () => {
    const href = linkNaToets({
      blockSlug: 'h2-4a',
      chapterSlug: 'h2',
      topicSlug: 'raaklijn',
      clusterSlug: 'vergelijking',
    })
    expect(href).toBe('/oefenen?blok=h2-4a&cluster=vergelijking')

    const params = new URLSearchParams(href.slice(href.indexOf('?') + 1))
    const sel = losSelectieOp(
      {
        blok: params.get('blok'),
        topic: params.get('topic'),
        cluster: params.get('cluster'),
        chapter: params.get('chapter'),
      },
      oefenData,
    )
    expect(sel?.soort).toBe('blok')
    if (sel?.soort !== 'blok') return
    expect(sel.blok.slug).toBe('h2-4a')
    expect(sel.groep.clusterSlug).toBe('vergelijking')
  })

  it('houdt de oude link als de som niet in een blok zit', () => {
    expect(
      linkNaToets({
        blockSlug: '',
        chapterSlug: 'beweging',
        topicSlug: 'snelheid',
        clusterSlug: 'snelheid',
      }),
    ).toBe('/oefenen?chapter=beweging&topic=snelheid&cluster=snelheid')
  })

  it('houdt de oude link als de schakelaar op onderwerp staat', () => {
    expect(
      linkNaToets(
        {
          blockSlug: 'h2-4a',
          chapterSlug: 'h2',
          topicSlug: 'raaklijn',
          clusterSlug: 'vergelijking',
        },
        'onderwerp',
      ),
    ).toBe('/oefenen?chapter=h2&topic=raaklijn&cluster=vergelijking')
  })
})
