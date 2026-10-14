import { describe, expect, it } from 'vitest'

import {
  bouwDashboardIndeling,
  bouwOnderwerpVoortgang,
  hrefVoorBlok,
  weegClusters,
  type VoortgangRij,
} from '@/lib/dashboard/indeling'

const h2 = {
  id: 'c2',
  slug: 'h2',
  title: 'De afgeleide functie',
  order_index: 2,
}
const beweging = {
  id: 'cb',
  slug: 'beweging',
  title: 'Beweging',
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
const p25 = {
  id: 'p25',
  chapter_id: 'c2',
  slug: 'h2-5',
  label: '2.5',
  title: 'Nog leeg',
  order_index: 5,
}

const blokA = {
  id: 'ba',
  paragraph_id: 'p24',
  slug: 'h2-4a',
  letter: 'A',
  title: 'Raaklijn',
  order_index: 1,
}
const blokB = {
  id: 'bb',
  paragraph_id: 'p24',
  slug: 'h2-4b',
  letter: 'B',
  title: 'Extreme waarden',
  order_index: 2,
}
const blokLeeg = {
  id: 'bleeg',
  paragraph_id: 'p25',
  slug: 'h2-5a',
  letter: 'A',
  title: 'Nog geen sommen',
  order_index: 1,
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
const extremen = topic('extremen', 'Extreme waarden', 'c2', 'bb', 3)
const los = topic('los', 'Nog zonder blok', 'c2', null, 4)
const snelheid = topic('snelheid', 'Snelheid', 'cb', null, 1)

function cluster(slug: string, topicId: string, order: number, blockId: string | null = null) {
  return {
    id: `c-${slug}`,
    slug,
    title: slug,
    topic_id: topicId,
    order_index: order,
    theory_block_id: blockId,
  }
}

const clusters = [
  cluster('raaklijn-a', raaklijn.id, 1),
  cluster('raaklijn-b', raaklijn.id, 2),
  cluster('helling', helling.id, 1),
  cluster('extremen', extremen.id, 1),
  cluster('los', los.id, 1),
  cluster('snelheid', snelheid.id, 1),
]

function rij(
  clusterId: string,
  status: string | null,
  answered: number,
  correct: number,
): VoortgangRij {
  return {
    cluster_id: clusterId,
    status,
    total_answered: answered,
    total_correct: correct,
  }
}

// Raaklijn A: beheerst (gewicht 1). Raaklijn B: 1 van 2 goed (gewicht 0,5).
// Helling: nog niets (gewicht 0). Samen in blok A: 1,5 / 3 = 50%.
const voortgang: VoortgangRij[] = [
  rij('c-raaklijn-a', 'mastered', 3, 3),
  rij('c-raaklijn-b', 'in_progress', 2, 1),
  rij('c-extremen', 'mastered', 3, 3),
  rij('c-snelheid', 'in_progress', 4, 2),
]

function indeling(soorten: typeof clusters = clusters) {
  return bouwDashboardIndeling({
    chapters: [beweging, h2],
    paragraphs: [p25, p24],
    blocks: [blokLeeg, blokB, blokA],
    topics: [snelheid, los, extremen, helling, raaklijn],
    clusters: soorten,
    voortgang,
  })
}

describe('dashboard per theorieblok', () => {
  it('zet hoofdstuk 2 vóór Beweging, en Beweging houdt zijn onderwerpen', () => {
    const boom = indeling()
    expect(boom.hoofdstukken.map((h) => h.slug)).toEqual(['h2', 'beweging'])

    const zonderBoek = boom.hoofdstukken.find((h) => h.slug === 'beweging')!
    expect(zonderBoek.paragrafen).toEqual([])
    expect(zonderBoek.losseOnderwerpen.map((o) => o.title)).toEqual(['Snelheid'])

    const boek = boom.hoofdstukken.find((h) => h.slug === 'h2')!
    expect(boek.paragrafen.map((p) => p.label)).toEqual(['2.4', '2.5'])
    expect(boek.losseOnderwerpen.map((o) => o.title)).toEqual(['Nog zonder blok'])
  })

  it('telt de soorten sommen van een blok op tot één percentage', () => {
    const boek = indeling().hoofdstukken.find((h) => h.slug === 'h2')!
    const paragraaf = boek.paragrafen.find((p) => p.label === '2.4')!
    const blok = paragraaf.blokken.find((b) => b.letter === 'A')!

    expect(blok.clusters.map((c) => c.id)).toEqual([
      'c-raaklijn-a',
      'c-raaklijn-b',
      'c-helling',
    ])
    expect(weegClusters(blok.clusters).pct).toBe(50)
    // De paragraaf telt blok A (1,5) en blok B (1 beheerst) op: 2,5 / 4 = 63%.
    expect(weegClusters(paragraaf.blokken.flatMap((b) => b.clusters)).pct).toBe(63)
    // Het hoofdstuk telt het losse onderwerp erbij: 2,5 / 5 = 50%.
    expect(weegClusters(boek.clusters).pct).toBe(50)
    expect(hrefVoorBlok(blok.slug)).toBe('/oefenen?blok=h2-4a')
  })

  it('telt een soort som met een eigen blok bij dat blok', () => {
    const metEigenBlok = indeling([
      ...clusters,
      cluster('snelheid-h2', raaklijn.id, 3, 'bb'),
    ])
    const boek = metEigenBlok.hoofdstukken.find((h) => h.slug === 'h2')!
    const paragraaf = boek.paragrafen.find((p) => p.label === '2.4')!
    const blokA = paragraaf.blokken.find((b) => b.letter === 'A')!
    const blokB = paragraaf.blokken.find((b) => b.letter === 'B')!

    expect(blokA.clusters.map((c) => c.id)).toEqual([
      'c-raaklijn-a',
      'c-raaklijn-b',
      'c-helling',
    ])
    expect(blokB.clusters.map((c) => c.id)).toEqual(['c-snelheid-h2', 'c-extremen'])
    expect(boek.clusters.map((c) => c.id)).toContain('c-snelheid-h2')
  })

  it('laat een blok zonder sommen zien, maar niet als link', () => {
    const leeg = indeling()
      .hoofdstukken.find((h) => h.slug === 'h2')!
      .paragrafen.find((p) => p.label === '2.5')!
      .blokken.find((b) => b.letter === 'A')!

    expect(leeg.heeftOpgaven).toBe(false)
    expect(leeg.clusters).toEqual([])
  })
})

describe('oude dashboardindeling', () => {
  it('groepeert nog steeds per onderwerp, niet per paragraaf', () => {
    const oud = bouwOnderwerpVoortgang({
      chapters: [beweging, h2],
      topics: [snelheid, los, extremen, helling, raaklijn],
      clusters,
      voortgang,
    })

    expect(oud.map((h) => h.slug)).toEqual(['h2', 'beweging'])
    expect(oud[0]!.topics.map((t) => t.title)).toEqual([
      'Raaklijn',
      'Helling',
      'Extreme waarden',
      'Nog zonder blok',
    ])
    expect(weegClusters(oud[0]!.topics[0]!.clusters).pct).toBe(75)
  })
})
