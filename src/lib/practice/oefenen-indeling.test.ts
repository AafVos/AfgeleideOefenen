import { describe, expect, it } from 'vitest'

import type {
  ChapterInfo,
  ClusterInfo,
  ParagraphInfo,
  TheoryBlockInfo,
  TopicInfo,
} from '@/lib/practice/chapter-overview'
import {
  ankerNaLaatsteOefening,
  ankerUitAdres,
  bouwBlokBoom,
  bouwOefenOverzicht,
  bouwOnderwerpBoom,
  kopjesVoorSelectie,
  losSelectieOp,
  naamVanSelectie,
  oefenIndeling,
} from '@/lib/practice/oefenen-indeling'

const h2: ChapterInfo = {
  id: 'c2',
  slug: 'h2',
  title: 'De afgeleide functie',
  book_part: 1,
  order_index: 2,
}
const beweging: ChapterInfo = {
  id: 'cb',
  slug: 'beweging',
  title: 'Beweging',
  book_part: 3,
  order_index: 10,
}
const h16: ChapterInfo = {
  id: 'c16',
  slug: 'h16',
  title: 'Examentraining',
  book_part: 4,
  order_index: 16,
}

const p24: ParagraphInfo = {
  id: 'p24',
  chapter_id: 'c2',
  slug: 'h2-4',
  label: '2.4',
  title: 'Toepassingen van de afgeleide',
  order_index: 4,
}
const p25: ParagraphInfo = {
  id: 'p25',
  chapter_id: 'c2',
  slug: 'h2-5',
  label: '2.5',
  title: 'Hellingen en raaklijnen met GeoGebra',
  order_index: 5,
}

const blokProduct: TheoryBlockInfo = {
  id: 'b-product',
  paragraph_id: 'p24',
  slug: 'h2-4a',
  letter: 'A',
  title: 'De productregel',
  order_index: 1,
}
const blokQuotient: TheoryBlockInfo = {
  id: 'b-quotient',
  paragraph_id: 'p24',
  slug: 'h2-4b',
  letter: 'B',
  title: 'De quotiëntregel',
  order_index: 2,
}
const blokLeeg: TheoryBlockInfo = {
  id: 'b-leeg',
  paragraph_id: 'p25',
  slug: 'h2-5a',
  letter: 'A',
  title: 'Grafieken tekenen met GeoGebra',
  order_index: 1,
}
const blokSnelheid: TheoryBlockInfo = {
  id: 'b-snelheid',
  paragraph_id: 'p24',
  slug: 'h2-4e',
  letter: 'E',
  title: 'Snelheid en afgeleide',
  order_index: 5,
}

function topic(
  slug: string,
  title: string,
  chapterId: string,
  blockId: string | null,
  order: number,
): TopicInfo {
  return {
    id: `t-${slug}`,
    slug,
    title,
    chapter_id: chapterId,
    order_index: order,
    theory_block_id: blockId,
  }
}

const product = topic('h2_productregel', 'Productregel', 'c2', 'b-product', 1)
const quotient = topic('h2_quotientregel', 'Quotiëntregel', 'c2', 'b-quotient', 2)
const snelheid = topic('beweging_snelheid', 'Snelheid', 'cb', null, 1)

function cluster(
  slug: string,
  title: string,
  topicId: string,
  order: number,
  blockId: string | null = null,
): ClusterInfo {
  return {
    id: `c-${slug}`,
    slug,
    title,
    topic_id: topicId,
    order_index: order,
    theory_block_id: blockId,
  }
}

const clusters: ClusterInfo[] = [
  cluster('product_twee', 'Twee polynomen', product.id, 1),
  cluster('product_kwadraat', 'Kwadraat', product.id, 2),
  cluster('quotient_breuk', 'Eenvoudige breuk', quotient.id, 1),
  cluster('beweging_snelheid_een', 'Snelheid op t', snelheid.id, 1),
]

const tiles = [
  { clusterId: 'c-product_twee' },
  { clusterId: 'c-product_kwadraat' },
  { clusterId: 'c-quotient_breuk' },
  { clusterId: 'c-beweging_snelheid_een' },
]

const data = {
  chapters: [h16, beweging, h2],
  paragraphs: [p25, p24],
  blocks: [blokLeeg, blokSnelheid, blokQuotient, blokProduct],
  topics: [quotient, snelheid, product],
  clusters,
  tiles,
}

describe('indeling per theorieblok', () => {
  it('staat voor leerlingen aan', () => {
    expect(oefenIndeling()).toBe('blok')
  })

  it('zet de hoofdstukken op boekvolgorde, ook zonder paragraaf', () => {
    const boom = bouwBlokBoom(data)
    expect(boom.hoofdstukken.map((h) => h.chapter.slug)).toEqual(['h2', 'beweging', 'h16'])
    expect(boom.oudeOpgaven).toEqual([])
    expect(boom.hoofdstukken.find((h) => h.chapter.slug === 'beweging')!.paragrafen).toEqual([])
    expect(boom.hoofdstukken.find((h) => h.chapter.slug === 'h16')!.paragrafen).toEqual([])
    const labels = boom.hoofdstukken
      .find((h) => h.chapter.slug === 'h2')!
      .paragrafen.map((p) => p.label)
    expect(labels).toEqual(['2.4', '2.5'])
  })

  it('maakt een blok zonder opgaven niet kiesbaar', () => {
    const h = bouwBlokBoom(data).hoofdstukken.find((node) => node.chapter.slug === 'h2')!
    const leeg = h.paragrafen.find((p) => p.slug === 'h2-5')!.blokken.find((b) => b.slug === 'h2-5a')
    expect(leeg?.heeftOpgaven).toBe(false)
    expect(leeg?.aantalOpgaven).toBe(0)
    expect(leeg?.title).toBe('Grafieken tekenen met GeoGebra')
    const product = h.paragrafen
      .find((p) => p.slug === 'h2-4')!
      .blokken.find((b) => b.slug === 'h2-4a')
    expect(product?.aantalOpgaven).toBe(2)
  })

  it('opent een hoofdstuk zonder paragraaf met de onderwerpen als kopjes', () => {
    const sel = losSelectieOp(
      { blok: null, topic: null, cluster: null, chapter: 'beweging' },
      data,
    )
    expect(sel?.soort).toBe('hoofdstuk')
    if (sel?.soort !== 'hoofdstuk') return
    expect(sel.chapter.slug).toBe('beweging')
    const kopjes = kopjesVoorSelectie(sel, data.topics, data.clusters, data.tiles)
    expect(kopjes.map((k) => k.label)).toEqual(['Snelheid'])
  })

  it('zet de soorten sommen als kopjes onder het theorieblok', () => {
    const sel = losSelectieOp(
      { blok: 'h2-4a', topic: null, cluster: null, chapter: null },
      data,
    )
    expect(sel?.soort).toBe('blok')
    if (sel?.soort !== 'blok') return
    expect(naamVanSelectie(sel)).toBe('2.4 A · De productregel')
    const kopjes = kopjesVoorSelectie(sel, data.topics, data.clusters, data.tiles)
    expect(kopjes.map((k) => k.label)).toEqual(['Productregel'])
    expect(kopjes[0]!.sub.map((s) => s.label)).toEqual(['Twee polynomen', 'Kwadraat'])
  })

  it('opent een oude onderwerp-link op het bijbehorende blok', () => {
    const sel = losSelectieOp(
      { blok: null, topic: 'h2_quotientregel', cluster: null, chapter: null },
      data,
    )
    expect(sel?.soort).toBe('blok')
    if (sel?.soort !== 'blok') return
    expect(sel.blok.slug).toBe('h2-4b')
    expect(sel.paragraph.label).toBe('2.4')
    expect(sel.groep.topicSlug).toBe('h2_quotientregel')
  })

  it('zet een soort som met een eigen blok niet bij het onderwerp', () => {
    const gesplitst = {
      ...data,
      clusters: [
        ...clusters,
        cluster('snelheid', 'Snelheid', product.id, 3, 'b-snelheid'),
      ],
      tiles: [...tiles, { clusterId: 'c-snelheid' }],
    }
    const boom = bouwBlokBoom(gesplitst)
    const blokken = boom.hoofdstukken
      .find((h) => h.chapter.slug === 'h2')!
      .paragrafen.find((p) => p.slug === 'h2-4')!.blokken
    expect(blokken.find((b) => b.slug === 'h2-4e')?.heeftOpgaven).toBe(true)

    const bijProduct = losSelectieOp(
      { blok: 'h2-4a', topic: null, cluster: null, chapter: null },
      gesplitst,
    )
    const bijSnelheid = losSelectieOp(
      { blok: 'h2-4e', topic: null, cluster: null, chapter: null },
      gesplitst,
    )
    const productKopjes = kopjesVoorSelectie(
      bijProduct!,
      gesplitst.topics,
      gesplitst.clusters,
      gesplitst.tiles,
    )
    const snelheidKopjes = kopjesVoorSelectie(
      bijSnelheid!,
      gesplitst.topics,
      gesplitst.clusters,
      gesplitst.tiles,
    )
    expect(productKopjes.map((k) => k.label)).toEqual(['Twee polynomen', 'Kwadraat'])
    expect(productKopjes.some((k) => k.label === 'Snelheid')).toBe(false)
    expect(snelheidKopjes.map((k) => k.label)).toEqual(['Snelheid'])

    const viaSoort = losSelectieOp(
      { blok: null, topic: null, cluster: 'snelheid', chapter: null },
      gesplitst,
    )
    expect(viaSoort?.soort).toBe('blok')
    if (viaSoort?.soort !== 'blok') return
    expect(viaSoort.blok.slug).toBe('h2-4e')
    expect(viaSoort.groep.topicSlug).toBe('h2_productregel')
  })

  it('kiest bij dezelfde soortnaam de soort van het genoemde onderwerp', () => {
    const h7: ChapterInfo = { ...h2, id: 'c7', slug: 'h7', title: 'Goniometrie', order_index: 7 }
    const h9: ChapterInfo = { ...h2, id: 'c9', slug: 'h9', title: 'Exp', order_index: 9 }
    const p7: ParagraphInfo = {
      ...p24,
      id: 'p7',
      chapter_id: 'c7',
      slug: 'h7-5',
      label: '7.5',
      title: 'Differentiëren',
    }
    const p9: ParagraphInfo = {
      ...p24,
      id: 'p9',
      chapter_id: 'c9',
      slug: 'h9-3',
      label: '9.3',
      title: 'E-machten',
    }
    const b7: TheoryBlockInfo = {
      ...blokProduct,
      id: 'b7',
      paragraph_id: 'p7',
      slug: 'h7-5a',
      title: 'Goniometrie',
    }
    const b9: TheoryBlockInfo = {
      ...blokProduct,
      id: 'b9',
      paragraph_id: 'p9',
      slug: 'h9-3c',
      title: 'E-machten',
    }
    const t7 = topic('h7_goniometrie_diff', 'Gonio', 'c7', 'b7', 1)
    const t9 = topic('h9_e_machten', 'E-macht', 'c9', 'b9', 1)
    const c7: ClusterInfo = { ...cluster('ketting_lineair', 'Lineair', t7.id, 1), id: 'c7-kl' }
    const c9: ClusterInfo = { ...cluster('ketting_lineair', 'Lineair', t9.id, 1), id: 'c9-kl' }
    const extra = {
      chapters: [h7, h9],
      paragraphs: [p7, p9],
      blocks: [b7, b9],
      topics: [t7, t9],
      // De laatste wint in een kaart op slug. Zonder onderwerp kom je dus bij h7.
      clusters: [c9, c7],
      tiles: [{ clusterId: 'c7-kl' }, { clusterId: 'c9-kl' }],
    }
    const metOnderwerp = losSelectieOp(
      { blok: null, topic: 'h9_e_machten', cluster: 'ketting_lineair', chapter: 'h9' },
      extra,
    )
    expect(metOnderwerp?.soort).toBe('blok')
    if (metOnderwerp?.soort !== 'blok') return
    expect(metOnderwerp.blok.slug).toBe('h9-3c')
    expect(metOnderwerp.groep.topicSlug).toBe('h9_e_machten')
    expect(metOnderwerp.groep.clusterSlug).toBe('ketting_lineair')

    const alleenSoort = losSelectieOp(
      { blok: null, topic: null, cluster: 'ketting_lineair', chapter: null },
      extra,
    )
    expect(alleenSoort?.soort).toBe('blok')
    if (alleenSoort?.soort !== 'blok') return
    expect(alleenSoort.blok.slug).toBe('h7-5a')
  })

  it('zet op de oefenpagina alle blokken met opgaven onder elkaar', () => {
    const overzicht = bouwOefenOverzicht(data)
    expect(overzicht.map((h) => h.chapter.slug)).toEqual(['h2', 'beweging'])
    const h2overzicht = overzicht[0]!
    expect(h2overzicht.paragrafen.map((p) => p.label)).toEqual(['2.4'])
    expect(h2overzicht.paragrafen[0]!.blokken.map((b) => b.letter)).toEqual(['A', 'B'])
    expect(overzicht[1]!.kopjes.map((k) => k.label)).toEqual(['Snelheid'])
  })

  it('zet verhaaltjes achter de gewone sommen van hetzelfde blok', () => {
    const metVerhaal = {
      ...data,
      tiles: [
        { clusterId: 'c-product_twee' },
        { clusterId: 'c-product_kwadraat', verhaal: true },
        { clusterId: 'c-quotient_breuk' },
        { clusterId: 'c-beweging_snelheid_een' },
      ],
    }
    const sel = losSelectieOp(
      { blok: 'h2-4a', topic: null, cluster: null, chapter: null },
      metVerhaal,
    )
    const kopjes = kopjesVoorSelectie(sel!, metVerhaal.topics, metVerhaal.clusters, metVerhaal.tiles)
    expect(kopjes.map((k) => k.label)).toEqual(['Productregel', 'Kwadraat'])
  })

  it('scrolt een leeg adres niet naar een verhaaltjesblok', () => {
    const leeg = { blok: null, topic: null, cluster: null, chapter: null }
    expect(ankerUitAdres(leeg, losSelectieOp(leeg, data))).toBeNull()
    expect(ankerUitAdres({ ...leeg, chapter: 'h2' }, null)).toBe('hoofdstuk-h2')
    expect(ankerUitAdres({ ...leeg, blok: 'h2-4a' }, null)).toBe('blok-h2-4a')
  })

  it('komt na oefenen terug bij dat blok, behalve als het alleen verhaaltjes zijn', () => {
    expect(ankerNaLaatsteOefening('c-product_twee', data)).toBe('blok-h2-4a')
    expect(ankerNaLaatsteOefening('c-beweging_snelheid_een', data)).toBe('hoofdstuk-beweging')
    const alleenVerhaal = {
      ...data,
      tiles: data.tiles.map((t) =>
        t.clusterId.startsWith('c-product') ? { ...t, verhaal: true } : t,
      ),
    }
    expect(ankerNaLaatsteOefening('c-product_twee', alleenVerhaal)).toBe('hoofdstuk-h2')
    expect(ankerNaLaatsteOefening(null, data)).toBeNull()
  })

  it('opent een oude soort-som-link op hetzelfde blok en die groep', () => {
    const sel = losSelectieOp(
      { blok: null, topic: null, cluster: 'product_kwadraat', chapter: null },
      data,
    )
    expect(sel?.soort).toBe('blok')
    if (sel?.soort !== 'blok') return
    expect(sel.blok.slug).toBe('h2-4a')
    expect(sel.groep.clusterSlug).toBe('product_kwadraat')
    expect(sel.groep.topicSlug).toBe('h2_productregel')
  })
})

describe('oude indeling per onderwerp', () => {
  it('houdt de boom van hoofdstuk, onderwerp en soort som in leven', () => {
    const boom = bouwOnderwerpBoom([h2], [product, quotient], clusters)
    expect(boom).toHaveLength(1)
    expect(boom[0]!.onderwerpen.map((o) => o.title)).toEqual(['Productregel', 'Quotiëntregel'])
    expect(boom[0]!.onderwerpen[0]!.clusters.map((c) => c.title)).toEqual([
      'Twee polynomen',
      'Kwadraat',
    ])
  })
})
